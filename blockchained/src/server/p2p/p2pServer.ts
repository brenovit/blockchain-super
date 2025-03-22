import { Logger } from "../../utils/logger.js";
import { BlockchainService } from "../../blockchain/service/blockchain-service.js";
import { EventType, NodeEvent, NodeMessage } from "../node-event.js";
import { Block, Blockchain } from "../../blockchain/model/blockchain.js";
import {
  addEvent,
  hasEvent,
  MY_ID,
  node,
  safePublish,
} from "./p2p-server-node.js";
import { Topics } from "./p2p-topic.js";
import {
  handleElection,
  handleMasterAnnouncement,
  isMaster,
} from "./election-flow.js";

const INITIAL_ID = 1;
const argId = process.argv.slice(2)[0] ?? INITIAL_ID;

const blockchainNodeId = Number(argId);
Logger.info(`🚀 Starting blockchain node with id: ${blockchainNodeId}`);
const blockchain = new BlockchainService(blockchainNodeId);

// Subscribe to Topics
await node.services.pubsub.subscribe(Topics.BLOCKCHAIN);
await node.services.pubsub.subscribe(Topics.ELECTION);
await node.services.pubsub.subscribe(Topics.VOTE);

//listen to messages
node.services.pubsub.addEventListener("message", handleEvent);
Logger.info(`🌍 Listening for blockchain messages...`);

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
      handleMasterAnnouncement(event.data, blockchain.data);
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
      handleBlockchainUpdate(event.data);
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
  if (isMaster()) {
    Logger.info(`🚀 Master node sending blockchain to ${event.sender}`);
    safePublish(Topics.BLOCKCHAIN, {
      type: EventType.BLOCKCHAIN_UPDATE,
      data: blockchain.data,
    });
  }
}

function broadcastBlockchain() {
  if (isMaster()) {
    Logger.trace("📡 Broadcasting blockchain...");
    safePublish(Topics.BLOCKCHAIN, {
      type: EventType.BLOCKCHAIN,
      data: blockchain.data,
    });
  }
}

function handleBlockchainUpdate(newChain: Blockchain) {
  Logger.info(
    `🔄 Received blockchain update with ${newChain.chain.length} blocks`
  );

  const isValidChain = blockchain.checkChainValid(newChain);
  if (isValidChain) {
    blockchain.loadChainFromNetwork(newChain);
    Logger.info(`✅ Blockchain updated successfully`);
  } else {
    Logger.warn(`❌ Received blockchain is invalid`);
  }
}

let processingBlock = false;
let pendingBlock: Block | null = null;
let votes: { [peerId: string]: boolean } = {};

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

//============= START: Node maintanance
setTimeout(() => {
  safePublish(Topics.BLOCKCHAIN, {
    type: EventType.REQUEST_SYNC_BLOCKCHAIN_SERVER,
  });
}, 10000);
//============= STOP: Node maintanance
