import { Logger } from "../../utils/logger.js";
import { EventType } from "../node-event.js";
import { getSubscribers, MY_ID, safePublish } from "./p2p-server-node.js";
import { Topics } from "./p2p-topic.js";
import { v4 as uuidv4 } from "uuid";

let _isMaster = false; // Tracks if the node is master
let currentMasterId: string | null = null; // Stores the current master node ID

//============= START: Elect master node (leader-election)
function checkIfMasterNodeDisconnected(peerId: string) {
  if (currentMasterId === peerId) {
    Logger.warn(
      `🚨 Master node ${peerId} has disconnected. 🗳️ Erasing master id`
    );
    currentMasterId = null;
  }
}

function handleMasterAnnouncement(masterId: any, blockchain: any) {
  setNodeAsMaster(masterId);
  if (_isMaster) {
    safePublish(Topics.BLOCKCHAIN, {
      type: EventType.BLOCKCHAIN_UPDATE,
      data: blockchain,
    });
  }
}

function handleElection(data: any) {
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
    trackElectionRound(data);
  }
}

const voteCounts: Record<string, number> = {}; // key = candidateId

function handleElectionVoteResponse(data: any) {
  if (data.roundId === activeElectionRound) {
    //add vote for candidate
    voteCounts[data.candidateId] = (voteCounts[data.candidateId] || 0) + 1;

    const totalPeers = getSubscribers(Topics.ELECTION).length + 1;
    const requiredVotes = Math.ceil(totalPeers / 2);

    const sortedCandidates = Object.entries(voteCounts) //convert to array
      .filter(([_, count]) => count >= requiredVotes) //filter with count bigger than required votes
      .sort(([aId], [bId]) => aId.localeCompare(bId)); // sort alphabetically

    if (sortedCandidates.length > 0) {
      const [electedId] = sortedCandidates[0];

      if (electedId === MY_ID) {
        Logger.info(`✅ You have been elected master with tie-breaker!`);
        electNodeAsMaster(MY_ID);
      } else {
        Logger.info(`👑 ${electedId} is elected as master (you lost).`);
      }

      activeElectionRound = null;
    } else {
      Logger.warn("No condidate elected yet");
    }
  }
}

type VoteRecord = {
  roundId: string;
  votedFor: string; // candidateId
};

let activeVote: VoteRecord | null = null;

function trackElectionRound(data: any) {
  const { roundId, candidateId } = data;
  Logger.trace(
    `📩 Received election message from ${candidateId} for round ${roundId}`
  );

  if (!activeVote || activeVote.roundId !== roundId) {
    activeVote = { roundId, votedFor: candidateId };
  }

  if (candidateId < activeVote.votedFor) {
    activeVote.votedFor = candidateId;
  }

  safePublish(Topics.ELECTION, {
    type: EventType.VOTE_RESPONSE,
    data: {
      roundId,
      vote: true,
      voter: MY_ID,
      candidateId,
    },
  });
}

let activeElectionRound: string | null = null;

function startElection() {
  const delay = Math.floor(Math.random() * 2000) + 500; // ⏳ Random delay between 0.5-2 seconds
  Logger.debug(
    `⏳ Waiting ${delay / 1000} seconds before starting election...`
  );

  //Wait before starting election
  setTimeout(() => {
    if (!currentMasterId) {
      const roundId = uuidv4();
      Logger.debug(`🎭 Starting leader election round: ${roundId}...`);

      safePublish(Topics.ELECTION, {
        type: EventType.ELECTION,
        data: {
          candidateId: MY_ID,
          roundId,
        },
      });

      activeElectionRound = roundId;
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

function setNodeAsMaster(nodeId: string) {
  currentMasterId = nodeId;
  _isMaster = currentMasterId === MY_ID;
  if (_isMaster) {
    Logger.debug(`👑 I am the new master: ${nodeId}`);
  } else {
    Logger.debug(`🫡 I elect the new master: ${nodeId}`);
  }
}

function isMaster() {
  return _isMaster;
}

// Check for master failure every 5 seconds
setInterval(() => {
  if (_isMaster) return; // Skip if already master
  if (!currentMasterId) {
    Logger.debug("🚨 Master node is missing, starting election...");
    startElection();
  }
}, 5000);
//============= STOP: Elect master node (leader-election)

export {
  handleElection,
  handleMasterAnnouncement,
  handleElectionVoteResponse,
  checkIfMasterNodeDisconnected,
  isMaster,
};
