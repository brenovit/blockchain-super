import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import { noise } from "@chainsafe/libp2p-noise";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { yamux } from "@chainsafe/libp2p-yamux";
import { Logger } from "./logger.js";
import { Block, BlockchainService } from "./blockchain-service.js";
import { identify } from "@libp2p/identify";
import { mdns } from "@libp2p/mdns";
import { NodeEvent } from "./node-event.js";

const INITIAL_ID = 1;
const argId = process.argv.slice(2)[0] ?? INITIAL_ID;

const blockchainNodeId = Number(argId);
Logger.info(`🚀 Starting blockchain node with id: ${blockchainNodeId}`);

const BLOCKCHAIN_TOPIC = "blockchain";
const ELECTION_TOPIC = "leader-election";

let isMaster = false; // Tracks if the node is master
let currentMasterId: string | null = null; // Stores the current master node ID

(async () => {
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

  let blockchain = new BlockchainService(blockchainNodeId);

  // Subscribe to topics
  await node.services.pubsub.subscribe(BLOCKCHAIN_TOPIC);
  await node.services.pubsub.subscribe(ELECTION_TOPIC);
  node.services.pubsub.addEventListener("message", handleEvent);

  Logger.info(`🌍 Listening for blockchain messages...`);

  function handleEvent(message: any) {
    const event = JSON.parse(
      new TextDecoder().decode(message.detail.data)
    ) as NodeEvent;

    Logger.trace(`📩 Received event: ${JSON.stringify(event, null, 1)}`);

    switch (event.type) {
      case "REQUEST_SYNC_BLOCKCHAIN":
        broadcastBlockchain();
        break;
      case "MASTER_ANNOUNCEMENT":
        handleMasterAnnouncement(event.data);
        break;
      case "ELECTION":
        handleElection(event.data);
        break;
      case "BLOCKCHAIN":
        //blockchain.replaceChain(event.data);
        break;
      case "ADD_BLOCK":
        blockchain.addBlock(event.data);
        broadcastBlockchain();
        break;
      case "CREATE_BLOCK":
        const newBlock = blockchain.createAndAddBlock({
          data: event.data,
          clientId: "2",
        });
        broadcastBlock(newBlock);
        broadcastBlockchain();
        break;
      case "MINE_BLOCK":
        blockchain.mineBlock(event.data);
        //sendBlockchain();
        break;
      default:
        Logger.warn(`Unknown event type: ${event.type}`);
    }
  }

  function broadcastBlock(block: Block) {
    Logger.trace("📡 Broadcasting new block...");
    safePublish(BLOCKCHAIN_TOPIC, { type: "ADD_BLOCK", data: block });
  }

  node.addEventListener("peer:discovery", (event) => {
    Logger.debug(`🔍 Discovered new peer: ${event.detail.id}`);
    peerDiscovery(event.detail.id);
  });

  async function peerDiscovery(peerId: any) {
    await node
      .dial(peerId)
      .catch((err) => Logger.error(`❌ Failed to connect to peer: ${err}`));

    //broadcastBlockchain();
    checkIfMasterNode(peerId.toString());
  }

  function broadcastBlockchain() {
    Logger.trace("📡 Broadcasting blockchain...");
    safePublish(BLOCKCHAIN_TOPIC, {
      type: "BLOCKCHAIN",
      data: blockchain.data,
    });
  }

  node.addEventListener("peer:disconnect", (event) => {
    const peerId = event.detail.toString();
    Logger.debug(`❌ Peer disconnected: ${peerId}`);
    checkIfMasterNode(peerId);
  });

  function checkIfMasterNode(peerId: string) {
    if (currentMasterId === peerId) {
      Logger.warn(
        `🚨 Master node ${peerId} has disconnected. 🗳️ Starting re-election...`
      );
      currentMasterId = null;
      startElection();
    }
  }

  function handleMasterAnnouncement(masterId: any) {
    currentMasterId = masterId;
    isMaster = currentMasterId === myId;
    if (isMaster) {
      Logger.debug(`👑 I am the new master: ${myId}`);
    } else {
      Logger.info(`👑 Master Node elected is: ${currentMasterId}`);
    }
  }

  function handleElection(electId: any) {
    Logger.debug(`🗳️ Starting election...`);
    if (isMaster) {
      Logger.info(`👑 I am already the new master: ${myId}`);
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
    Logger.debug("⚡ Starting leader election...");

    safePublish(ELECTION_TOPIC, { type: "ELECTION", data: myId }).then(
      () =>
        setTimeout(() => {
          if (!currentMasterId) {
            electNodeAsMaster(myId);
          }
        }, 5000) // Wait 5 seconds after succesfully publish, to ensure no other node claims master first
    );
  }

  function electNodeAsMaster(nodeId: string) {
    currentMasterId = nodeId;
    isMaster = currentMasterId === myId;
    if (isMaster) {
      Logger.debug(`👑 I am the new master: ${nodeId}`);
    } else {
      Logger.debug(`👑 I elect the new master: ${nodeId}`);
    }
    safePublish(ELECTION_TOPIC, {
      type: "MASTER_ANNOUNCEMENT",
      data: nodeId,
    });
  }

  async function safePublish(
    topic: string,
    message: any,
    maxRetries = 3,
    delay = 1000
  ) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const peers = node.services.pubsub.getSubscribers(topic);

      if (peers.length > 0) {
        try {
          Logger.debug(
            `📡 Publishing to ${topic} (Attemp ${attempt}/${maxRetries}`
          );
          return await node.services.pubsub.publish(
            topic,
            new TextEncoder().encode(JSON.stringify(message))
          );
        } catch (error) {
          Logger.error(
            `❌ Error publishing (Attemp ${attempt}/${maxRetries}): ${error}`
          );
        }
      } else {
        Logger.warn(
          `⚠️ No peers subscribed to ${topic}. (Attemp ${attempt}/${maxRetries}). Retrying in ${
            delay / 1000
          } seconds...`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    Logger.error(
      `❌ Failed to publish to ${topic} after ${maxRetries} attempts.`
    );
    return Promise.resolve();
  }

  setInterval(() => {
    if (isMaster) return; // Skip if already master

    if (!currentMasterId) {
      Logger.info("🚨 Master node is missing, starting re-election...");
      startElection();
    }
  }, 10000); // Check for master failure every 10 seconds
})();
