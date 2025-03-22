import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import { noise } from "@chainsafe/libp2p-noise";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { yamux } from "@chainsafe/libp2p-yamux";
import { Logger } from "./logger.js";
import { Block, BlockchainService } from "./blockchain-service.js";
import { identify } from "@libp2p/identify";
import { mdns } from "@libp2p/mdns";
import { NodeEvent, NodeMessage } from "./node-event.js";
import crypto from "crypto";

const INITIAL_ID = 1;
const argId = process.argv.slice(2)[0] ?? INITIAL_ID;

const blockchainNodeId = Number(argId);
Logger.info(`🚀 Starting blockchain node with id: ${blockchainNodeId}`);
const blockchain = new BlockchainService(blockchainNodeId);

type TopicName = "blockchain" | "leader-election" | "vote";

const ELECTION_TOPIC: TopicName = "leader-election";
const VOTE_TOPIC: TopicName = "vote";
const BLOCKCHAIN_TOPIC: TopicName = "blockchain";

const topics = {
  ELECTION_TOPIC,
  VOTE_TOPIC,
  BLOCKCHAIN_TOPIC,
};

let isMaster = false; // Tracks if the node is master
let currentMasterId: string | null = null; // Stores the current master node ID
type MessageId = string | null;

let votes: { [peerId: string]: boolean } = {};
//let totalPeers = 1;

const node = await createLibp2p({
  addresses: {
    listen: ["/ip4/127.0.0.1/tcp/0/ws"], // Listen on a random available port
  },
  transports: [webSockets()],
  connectionEncrypters: [noise()],
  streamMuxers: [yamux()],
  peerDiscovery: [mdns()],
  services: {
    pubsub: gossipsub(),
    indentify: identify(),
  },
});

await node.start();
const myId = node.peerId.toString();
Logger.info(`🚀 libp2p Node started: ${myId}`);
const receivedEventIds = new Set<MessageId>(); // ✅ Track processed messages

let processingBlock = false;
let pendingBlock: Block | null = null;

// Subscribe to topics
await node.services.pubsub.subscribe(BLOCKCHAIN_TOPIC);
await node.services.pubsub.subscribe(ELECTION_TOPIC);
await node.services.pubsub.subscribe(VOTE_TOPIC);

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

  if (event.id && receivedEventIds.has(event.id)) {
    Logger.trace(`⚠️ Ignoring duplicated event: ${event.type} : ${event.id}`);
    return;
  }
  if (event.id) {
    receivedEventIds.add(event.id);
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
    case "MINE_BLOCK":
      blockchain.mineBlock(event.data);
      broadcastBlockchain();
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
      Logger.warn(`Unknown event type: ${event.type}`);
  }
}

function handleSyncNodes(event: any) {
  if (isMaster) {
    Logger.info(`🚀 Master node sending blockchain to ${event.sender}`);
    safePublish(topics.BLOCKCHAIN_TOPIC, {
      type: "BLOCKCHAIN_UPDATE",
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
  safePublish(topics.VOTE_TOPIC, {
    type: "VOTE_RESPONSE",
    data: {
      blockHash: data.block.hash,
      vote: isValid,
      voter: myId,
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

    safePublish(topics.VOTE_TOPIC, {
      type: "VOTE_REQUEST",
      data: {
        block: newBlock,
        proposer: myId,
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
    topics.BLOCKCHAIN_TOPIC
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
    safePublish(topics.BLOCKCHAIN_TOPIC, {
      type: "ADD_BLOCK",
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
    safePublish(BLOCKCHAIN_TOPIC, {
      type: "BLOCKCHAIN",
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
    safePublish(BLOCKCHAIN_TOPIC, {
      type: "BLOCKCHAIN_UPDATE",
      data: blockchain.data,
    });
  }
}

function setNodeAsMaster(nodeId: string) {
  currentMasterId = nodeId;
  isMaster = currentMasterId === myId;
  if (isMaster) {
    Logger.debug(`👑 I am the new master: ${nodeId}`);
  } else {
    Logger.debug(`🫡 I elect the new master: ${nodeId}`);
  }
}

function handleElection(electId: any) {
  Logger.debug(`🗳️ Starting election...`);
  if (isMaster) {
    Logger.debug(`👑 I am already the new master: ${myId}`);
    safePublish(ELECTION_TOPIC, {
      type: "MASTER_ANNOUNCEMENT",
      data: myId,
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

  safePublish(ELECTION_TOPIC, { type: "ELECTION", data: myId });
  Logger.debug(`⏳ Waiting ${delay / 1000} seconds before elect master...`);
  setTimeout(() => {
    if (!currentMasterId) {
      electNodeAsMaster(myId);
    }
  }, delay);
}

function electNodeAsMaster(nodeId: string) {
  setNodeAsMaster(nodeId);
  safePublish(ELECTION_TOPIC, {
    type: "MASTER_ANNOUNCEMENT",
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

//============= START: Publish to node
async function safePublish(
  topic: TopicName,
  message: NodeMessage,
  maxRetries = 1,
  delay = 1000
) {
  const event = generateEventWithId(message);
  if (receivedEventIds.has(event.id)) {
    Logger.trace(`⚠️ Not rebroadcasting duplicate message: ${event.id}`);
    return;
  }

  receivedEventIds.add(event.id);
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const peers = node.services.pubsub.getSubscribers(topic);

    if (peers.length > 0) {
      try {
        Logger.trace(
          `📡 Publishing to topic [${topic}] | ${event.type} : ${event.id} | Attemp: ${attempt}/${maxRetries}`
        );
        return await node.services.pubsub.publish(
          topic,
          new TextEncoder().encode(JSON.stringify(event))
        );
      } catch (error) {
        Logger.error(
          `❌ Error publishing on attemp ${attempt}/${maxRetries}: ${error}`
        );
      }
    } else {
      Logger.warn(
        `⚠️ No peers subscribed to ${topic}. Attemp ${attempt}/${maxRetries}. Retrying in ${
          delay / 1000
        } seconds...`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  Logger.warn(`⛔ Failed to publish to ${topic} after ${maxRetries} attempts.`);
  return Promise.resolve();
}

function generateEventWithId(event: NodeMessage): NodeEvent {
  return {
    id: crypto.createHash("sha1").update(JSON.stringify(event)).digest("hex"),
    data: event.data,
    type: event.type,
  };
}
//============= STOP: Publish to node

//============= START: Node maintanance
// Erase messages id every 15 seconds
setInterval(() => {
  receivedEventIds.clear();
}, 15000);

setTimeout(() => {
  safePublish(topics.BLOCKCHAIN_TOPIC, {
    type: "REQUEST_SYNC_BLOCKCHAIN_SERVER",
  });
}, 10000);
//============= STOP: Node maintanance
