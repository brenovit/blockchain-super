import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import { noise } from "@chainsafe/libp2p-noise";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { yamux } from "@chainsafe/libp2p-yamux";
import { Logger } from "./logger.js";
import { Block, BlockchainService } from "./blockchain-service.js";
import { identify } from "@libp2p/identify";
import { mdns } from "@libp2p/mdns";
import { kadDHT } from "@libp2p/kad-dht";

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
  let blockchain = new BlockchainService(500);

  // Subscribe to blockchain updates
  node.services.pubsub.subscribe("blockchain");

  node.services.pubsub.addEventListener("message", (message) => {
    const event = JSON.parse(new TextDecoder().decode(message.detail.data));
    Logger.info(`📩 Received block: ${JSON.stringify(event, null, 2)}`);

    switch (event.type) {
      case "BLOCKCHAIN":
        //blockchain.replaceChain(event.data);
        break;
      case "ADD_BLOCK":
        blockchain.addBlock(event.data);
        break;
      case "CREATE_BLOCK":
        const newBlock = blockchain.createAndAddBlock({
          data: event.data,
          clientId: event.clientId,
        });
        broadcastBlock(newBlock);
        break;
      case "MINE_BLOCK":
        blockchain.mineBlock(event.data);
        //sendBlockchain();
        break;
      default:
        Logger.info("Unknown message type");
    }
  });

  function broadcastBlock(block: Block) {
    Logger.info("📡 Broadcasting new block...");
    try {
      node.services.pubsub.publish(
        "blockchain",
        new TextEncoder().encode(JSON.stringify({ type: "ADD_BLOCK", block }))
      );
    } catch (error) {
      Logger.error(`Error broadcasting block: ${error}`);
    }
  }

  Logger.info(`🌍 Listening for blockchain messages...`);

  node.addEventListener("peer:discovery", (event) => {
    console.log(`🔍 Discovered new peer: ${event.detail.id.toString()}`);
    node
      .dial(event.detail.id)
      .catch((err) => console.error("❌ Failed to connect to peer:", err));
  });

  // Add a test block every 10 seconds for demonstration
  /*setInterval(() => {
    Logger.debug("⛏️ Mining new block...");
    const newBlock = blockchain.createAndAddBlock(
      "Test data " + new Date().toISOString()
    );
    broadcastBlock(newBlock);
  }, 10000);*/
})();
