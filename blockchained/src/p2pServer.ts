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

const nodeId = Number(argId);
Logger.info(`🚀 Starting node with id: ${nodeId}`);

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
  Logger.info(`🚀 libp2p Node started: ${node.peerId.toString()}`);

  let blockchain = new BlockchainService(nodeId);

  // Subscribe to topics
  node.services.pubsub.subscribe(BLOCKCHAIN_TOPIC);
  node.services.pubsub.subscribe(ELECTION_TOPIC);
  node.services.pubsub.addEventListener("message", handleEvent);

  Logger.info(`🌍 Listening for blockchain messages...`);

  function handleEvent(message: any) {
    const event = JSON.parse(
      new TextDecoder().decode(message.detail.data)
    ) as NodeEvent;

    Logger.trace(`📩 Received event: ${JSON.stringify(event, null, 1)}`);

    switch (event.type) {
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
        break;
      case "CREATE_BLOCK":
        const newBlock = blockchain.createAndAddBlock({
          data: event.data,
          clientId: "2",
        });
        broadcastBlock(newBlock);
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

    broadcastBlockchain();
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
    Logger.info(`👑 Master Node is now: ${currentMasterId}`);
  }

  function handleElection(electId: any) {
    const myId = node.peerId.toString();
    if (isMaster) {
      Logger.info(`👑 I am already the new master: ${myId}`);
      safePublish(ELECTION_TOPIC, {
        type: "MASTER_ANNOUNCEMENT",
        data: myId,
      });
      return; // Skip if already master
    }

    if (!currentMasterId) {
      Logger.debug(`🗳️ Starting election...`);
      startElection();
    }
  }

  function startElection() {
    const myId = node.peerId.toString();
    Logger.debug("⚡ Starting leader election...");

    safePublish(ELECTION_TOPIC, { type: "ELECTION", data: myId });

    setTimeout(() => {
      if (!currentMasterId) {
        isMaster = true;
        currentMasterId = myId;
        Logger.debug(`👑 I am the new master: ${myId}`);
        safePublish(ELECTION_TOPIC, {
          type: "MASTER_ANNOUNCEMENT",
          data: myId,
        });
      }
    }, 3000); // Wait 3 seconds to ensure no other node claims master first
  }

  async function safePublish(topic: string, message: NodeEvent) {
    const peersSubscribed = node.services.pubsub.getSubscribers(topic);

    if (peersSubscribed.length === 0) {
      Logger.warn(`⚠️  No peers subscribed to ${topic}. Skipping publish.`);
      return;
    }

    try {
      Logger.trace(
        `📡 Publishing to ${topic} : ${JSON.stringify(message, null, 2)}`
      );
      await node.services.pubsub.publish(
        topic,
        new TextEncoder().encode(JSON.stringify(message))
      );
      Logger.trace(`📡 Published to ${topic}`);
    } catch (error) {
      Logger.error(`❌ Error publishing to ${topic}: ${error}`);
    }
  }

  setInterval(() => {
    if (isMaster) return; // Skip if already master

    if (!currentMasterId) {
      Logger.info("🚨 Master node is missing, starting re-election...");
      startElection();
    }
  }, 5000); // Check for master failure every 5 seconds
})();
