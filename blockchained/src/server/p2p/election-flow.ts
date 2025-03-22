import { Logger } from "../../utils/logger.js";
import { EventType } from "../node-event.js";
import { MY_ID, safePublish } from "./p2p-server-node.js";
import { Topics } from "./p2p-topic.js";

let _isMaster = false; // Tracks if the node is master
let currentMasterId: string | null = null; // Stores the current master node ID

//============= START: Elect master node (leader-election)
function checkIfMasterNodeDisconnected(peerId: string) {
  if (currentMasterId === peerId) {
    Logger.debug(
      `🚨 Master node ${peerId} has disconnected. 🗳️ Starting re-election...`
    );
    currentMasterId = null;
    startElection();
  }
}

function handleMasterAnnouncement(masterId: any, blockchain: any) {
  setNodeAsMaster(masterId);
  if (_isMaster) {
    //blockchain.startChain();
    safePublish(Topics.BLOCKCHAIN, {
      type: EventType.BLOCKCHAIN_UPDATE,
      data: blockchain,
    });
  }
}

function setNodeAsMaster(nodeId: string) {
  currentMasterId = nodeId;
  _isMaster = currentMasterId === MY_ID;
  if (_isMaster) {
    Logger.debug(`👑 I am the new master: ${nodeId}`);
  } else {
    Logger.debug(`🫡 I elect the new master: ${nodeId}`);
  }
}

function handleElection(electId: any) {
  Logger.debug(`🗳️ Starting election...`);
  if (_isMaster) {
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

function isMaster() {
  return _isMaster;
}

// Check for master failure every 10 seconds
setInterval(() => {
  if (_isMaster) return; // Skip if already master
  if (!currentMasterId) {
    Logger.warn("🚨 Master node is missing, starting election...");
    startElection();
  }
}, 5000);
//============= STOP: Elect master node (leader-election)

export {
  handleElection,
  handleMasterAnnouncement,
  checkIfMasterNodeDisconnected,
  isMaster,
};
