import { Logger } from "../../utils/logger.js";
import { EventType } from "../node-event.js";
import { getSubscribers, MY_ID, safePublish } from "./p2p-server-node.js";
import { Topics } from "./p2p-topic.js";
import { v4 as uuidv4 } from "uuid";

let _isMain = false; // Tracks if the node is main
let currentMainId: string | null = null; // Stores the current main node ID

//============= START: Elect main node (leader-election)
function checkIfMainNodeDisconnected(peerId: string) {
  if (currentMainId === peerId) {
    Logger.warn(`🚨 Main node ${peerId} has disconnected. 🗳️ Erasing main id`);
    currentMainId = null;
  }
}

function handleMainAnnouncement(mainId: any, blockchain: any) {
  setNodeAsMain(mainId);
  if (_isMain) {
    safePublish(Topics.BLOCKCHAIN, {
      type: EventType.BLOCKCHAIN_UPDATE,
      data: blockchain,
    });
  }
}

function handleElection(data: any) {
  Logger.debug(`🗳️ Starting election...`);
  if (_isMain) {
    Logger.debug(`👑 I am already the new main: ${MY_ID}`);
    safePublish(Topics.NETWORK_LEADER_ELECTION, {
      type: EventType.MAIN_NODE_ANNOUNCEMENT,
      data: MY_ID,
    });
    return; // Skip if already main
  }

  if (!currentMainId) {
    trackElectionRound(data);
  }
}

const voteCounts: Record<string, number> = {}; // key = candidateId

function handleElectionVoteResponse(data: any) {
  if (data.roundId === activeElectionRound) {
    //add vote for candidate
    voteCounts[data.candidateId] = (voteCounts[data.candidateId] || 0) + 1;

    const totalPeers =
      getSubscribers(Topics.NETWORK_LEADER_ELECTION).length + 1;
    const requiredVotes = Math.ceil(totalPeers / 2);

    const sortedCandidates = Object.entries(voteCounts) //convert to array
      .filter(([_, count]) => count >= requiredVotes) //filter with count bigger than required votes
      .sort(([aId], [bId]) => aId.localeCompare(bId)); // sort alphabetically

    if (sortedCandidates.length > 0) {
      const [electedId] = sortedCandidates[0];

      if (electedId === MY_ID) {
        Logger.info(`✅ You have been elected main with tie-breaker!`);
        electNodeAsMain(MY_ID);
      } else {
        Logger.info(`👑 ${electedId} is elected as main (you lost).`);
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

  safePublish(Topics.NETWORK_LEADER_ELECTION, {
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
    if (!currentMainId) {
      const roundId = uuidv4();
      Logger.debug(`🎭 Starting leader election round: ${roundId}...`);

      safePublish(Topics.NETWORK_LEADER_ELECTION, {
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

function electNodeAsMain(nodeId: string) {
  setNodeAsMain(nodeId);
  safePublish(Topics.NETWORK_LEADER_ELECTION, {
    type: EventType.MAIN_NODE_ANNOUNCEMENT,
    data: nodeId,
  });
}

function setNodeAsMain(nodeId: string) {
  currentMainId = nodeId;
  _isMain = currentMainId === MY_ID;
  if (_isMain) {
    Logger.debug(`👑 I am the new main: ${nodeId}`);
  } else {
    Logger.debug(`🫡 I elect the new main: ${nodeId}`);
  }
}

function isMain() {
  return _isMain;
}

// Check for main failure every 5 seconds
setInterval(() => {
  if (_isMain) return; // Skip if already main
  if (!currentMainId) {
    Logger.debug("🚨 Main node is missing, starting election...");
    startElection();
  }
}, 5000);
//============= STOP: Elect main node (leader-election)

export {
  handleElection,
  handleMainAnnouncement,
  handleElectionVoteResponse,
  checkIfMainNodeDisconnected,
  isMain,
};
