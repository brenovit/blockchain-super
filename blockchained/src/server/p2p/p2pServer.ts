import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import { noise } from "@chainsafe/libp2p-noise";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { yamux } from "@chainsafe/libp2p-yamux";
import { Logger } from "../../utils/logger.js";
import { BlockchainService } from "../../blockchain/service/blockchain-service.js";
import { identify } from "@libp2p/identify";
import { mdns } from "@libp2p/mdns";
import { EventType, NodeEvent, NodeMessage } from "../node-event.js";
import crypto from "crypto";
import { Block } from "../../blockchain/model/blockchain.js";
import {
  addEvent,
  hasEvent,
  MY_ID,
  node,
  safePublish,
} from "./p2pServerNode.js";
import { Topics } from "./p2pTopic.js";

const INITIAL_ID = 1;
const argId = process.argv.slice(2)[0] ?? INITIAL_ID;

const blockchainNodeId = Number(argId);
Logger.info(`🚀 Starting blockchain node with id: ${blockchainNodeId}`);
const blockchain = new BlockchainService(blockchainNodeId);

let isMaster = false; // Tracks if the node is master
let currentMasterId: string | null = null; // Stores the current master node ID

let votes: { [peerId: string]: boolean } = {};

let processingBlock = false;
let pendingBlock: Block | null = null;

// Subscribe to Topics
await node.services.pubsub.subscribe(Topics.BLOCKCHAIN);
await node.services.pubsub.subscribe(Topics.ELECTION);
await node.services.pubsub.subscribe(Topics.VOTE);

//listen to messages
node.services.pubsub.addEventListener("message", handleEvent);
Logger.info(`🌍 Listening for blockchain messages...`);

node.addEventListener("peer:discovery", (event) => {
  Logger.info(`🔍 Discovered new peer: ${event.detail.id}`);
  peerDiscovery(event.detail.id);
});

async function peerDiscovery(peerId: any) {
  //totalPeers += 1;
  await node
    .dial(peerId)
    .catch((err) => Logger.error(`❌ Failed to connect to peer: ${err}`));
}

node.addEventListener("peer:disconnect", (event) => {
  const peerId = event.detail.toString();
  Logger.info(`❌ Peer disconnected: ${peerId}`);
  //totalPeers -= 1;
  checkIfMasterNode(peerId);
});

function handleEvent(message: any) {
  const event = JSON.parse(
    new TextDecoder().decode(message.detail.data)
  ) as NodeEvent;

  if (event.id && hasEvent(event.id)) {
    Logger.trace(`⚠️ Ignoring duplicated event: ${event.type} : ${event.id}`);
    return;
  }
  if (event.id) {
    addEvent(event.id);
  }
  Logger.trace(`📩 Received event: ${event.type} : ${event.id}`);

  switch (event.type) {
    case "MASTER_ANNOUNCEMENT":
      handleMasterAnnouncement(event.data);
      break;
    case "ELECTION":
      handleElection(event.data);
      break;
    case "REQUEST_SYNC_BLOCKCHAIN_SERVER": //Comes from server
      handleSyncNodes(event);
      break;
    case "REQUEST_SYNC_BLOCKCHAIN": //Comes from client
      broadcastBlockchain();
      break;
    case "BLOCKCHAIN_UPDATE":
      blockchain.loadChainFromNetwork(event.data);
      break;
    case "CREATE_BLOCK":
      handleCreateBlock(event.data);
      break;
    case "ADD_BLOCK":
      handleAddBlock(event.data);
      break;
    case "VOTE_RESPONSE":
      handleVoteResponse(event.data);
      break;
    case "VOTE_REQUEST":
      handleVoteRequest(event.data);
      break;
    case "BLOCKCHAIN": //Handled by from client
      break;
    default:
      Logger.warn(`Unknown/unmapped event type: ${event.type}`);
  }
}

function handleSyncNodes(event: any) {
  if (isMaster) {
    Logger.info(`🚀 Master node sending blockchain to ${event.sender}`);
    safePublish(Topics.BLOCKCHAIN, {
      type: EventType.BLOCKCHAIN_UPDATE,
      data: blockchain.data,
    });
  }
}

function handleVoteResponse(data: any) {
  if (pendingBlock && data.blockHash == pendingBlock.hash) {
    votes[data.voter] = data.vote;
  }
}
function handleVoteRequest(data: any) {
  Logger.info(`📩 Received vote request for block: ${data.block.hash}`);

  const isValid = blockchain.isValid(data.block);
  safePublish(Topics.VOTE, {
    type: EventType.VOTE_RESPONSE,
    data: {
      blockHash: data.block.hash,
      vote: isValid,
      voter: MY_ID,
    },
  });
}

async function handleCreateBlock(blockData: any) {
  if (processingBlock) return;
  processingBlock = true;
  const newBlock = await blockchain.createBlock({
    data: blockData,
    clientId: "2",
  });

  if (newBlock.valid) {
    pendingBlock = newBlock;

    votes = {};
    Logger.info(`🗳️ Requesting votes for new block: ${newBlock.hash}`);

    safePublish(Topics.VOTE, {
      type: EventType.VOTE_REQUEST,
      data: {
        block: newBlock,
        proposer: MY_ID,
      },
    });

    setTimeout(() => finalizeBlockDecision(), 5000);
  } else {
    Logger.warn(`❌ Mined block is invalid and won't be voted on.`);
  }
  processingBlock = false;
}

function handleAddBlock(block: any) {
  Logger.debug(`Block to be added: ${JSON.stringify(block)}`);
  if (blockchain.addBlock(block)) {
    Logger.info(
      `✅ Block acepted into the chain: ${block.index} : ${block.hash}`
    );
    return true;
  }
  Logger.warn(`❌ Block rejected: ${block.index} : ${block.hash}`);
  return false;
}

function finalizeBlockDecision() {
  if (!pendingBlock) return;

  const totalPeers = node.services.pubsub.getSubscribers(
    Topics.BLOCKCHAIN
  ).length;
  const totalVotes = Object.keys(votes).length;
  const yesVotes = Object.values(votes).filter((v) => v).length;

  Logger.debug(
    `totalVotes: ${totalVotes} | yesVotes: ${yesVotes} | totalPeer: ${totalPeers} | consensus: ${Math.ceil(
      totalPeers / 2
    )}`
  );

  if (totalVotes > 0 && yesVotes >= Math.ceil(totalPeers / 2) - 1) {
    Logger.debug(
      `✅ Block accepted by majority: ${JSON.stringify(pendingBlock)}`
    );
    safePublish(Topics.BLOCKCHAIN, {
      type: EventType.ADD_BLOCK,
      data: pendingBlock,
    });
  } else {
    Logger.warn(`❌ Block rejected by majority: ${pendingBlock.hash}`);
  }

  pendingBlock = null;
}

function broadcastBlockchain() {
  if (isMaster) {
    Logger.trace("📡 Broadcasting blockchain...");
    safePublish(Topics.BLOCKCHAIN, {
      type: EventType.BLOCKCHAIN,
      data: blockchain.data,
    });
  }
}

//============= START: Elect master node (leader-election)
function checkIfMasterNode(peerId: string) {
  if (currentMasterId === peerId) {
    Logger.debug(
      `🚨 Master node ${peerId} has disconnected. 🗳️ Starting re-election...`
    );
    currentMasterId = null;
    startElection();
  }
}

function handleMasterAnnouncement(masterId: any) {
  setNodeAsMaster(masterId);
  if (isMaster) {
    //blockchain.startChain();
    safePublish(Topics.BLOCKCHAIN, {
      type: EventType.BLOCKCHAIN_UPDATE,
      data: blockchain.data,
    });
  }
}

function setNodeAsMaster(nodeId: string) {
  currentMasterId = nodeId;
  isMaster = currentMasterId === MY_ID;
  if (isMaster) {
    Logger.debug(`👑 I am the new master: ${nodeId}`);
  } else {
    Logger.debug(`🫡 I elect the new master: ${nodeId}`);
  }
}

function handleElection(electId: any) {
  Logger.debug(`🗳️ Starting election...`);
  if (isMaster) {
    Logger.debug(`👑 I am already the new master: ${MY_ID}`);
    safePublish(Topics.ELECTION, {
      type: EventType.MASTER_ANNOUNCEMENT,
      data: MY_ID,
    });
    return; // Skip if already master
  }

  if (!currentMasterId) {
    electNodeAsMaster(electId);
  }
}

function startElection() {
  Logger.debug("🎭 Starting leader election...");
  const delay = Math.floor(Math.random() * 3000) + 1000; // ⏳ Random delay between 1-3 seconds

  safePublish(Topics.ELECTION, { type: EventType.ELECTION, data: MY_ID });
  Logger.debug(`⏳ Waiting ${delay / 1000} seconds before elect master...`);
  setTimeout(() => {
    if (!currentMasterId) {
      electNodeAsMaster(MY_ID);
    }
  }, delay);
}

function electNodeAsMaster(nodeId: string) {
  setNodeAsMaster(nodeId);
  safePublish(Topics.ELECTION, {
    type: EventType.MASTER_ANNOUNCEMENT,
    data: nodeId,
  });
}

// Check for master failure every 10 seconds
setInterval(() => {
  if (isMaster) return; // Skip if already master
  if (!currentMasterId) {
    Logger.warn("🚨 Master node is missing, starting election...");
    startElection();
  }
}, 5000);
//============= STOP: Elect master node (leader-election)

//============= START: Node maintanance

setTimeout(() => {
  safePublish(Topics.BLOCKCHAIN, {
    type: EventType.REQUEST_SYNC_BLOCKCHAIN_SERVER,
  });
}, 10000);
//============= STOP: Node maintanance
