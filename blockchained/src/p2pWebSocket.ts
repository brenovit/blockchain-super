import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import { noise } from "@chainsafe/libp2p-noise";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { yamux } from "@chainsafe/libp2p-yamux";
import { identify } from "@libp2p/identify";
import { mdns } from "@libp2p/mdns";
import { WebSocketServer, WebSocket } from "ws";
import { Logger } from "./logger.js";
import { NodeEvent } from "./node-event.js";

const WS_PORT = 5000;
const BLOCKCHAIN_TOPIC = "blockchain";

(async () => {
  // ✅ Step 1: Create libp2p node
  const node = await createLibp2p({
    addresses: {
      listen: ["/ip4/0.0.0.0/tcp/0/ws"], // Dynamic port
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

  // ✅ Step 2: Subscribe to libp2p blockchain events
  node.services.pubsub.subscribe(BLOCKCHAIN_TOPIC);
  node.services.pubsub.addEventListener("message", handleEvent);

  function handleEvent(message: any) {
    const event = JSON.parse(
      new TextDecoder().decode(message.detail.data)
    ) as Event;

    Logger.info(
      `📩 Received event from topic ${BLOCKCHAIN_TOPIC}: ${JSON.stringify(
        event
      )}`
    );

    notifyWebSocketClients(event);
  }

  function notifyWebSocketClients(event: Event) {
    console.log("📡 Notifying WebSocket clients...");
    wsClients.forEach((client) => {
      client.send(JSON.stringify(event));
    });
  }

  node.addEventListener("peer:discovery", (event) => {
    Logger.debug(`🔍 Discovered new peer: ${event.detail.id.toString()}`);
    node
      .dial(event.detail.id)
      .catch((err) => Logger.error(`❌ Failed to connect to peer: ${err}`));
  });

  // ✅ Step 3: Create WebSocket Server for Frontend
  const wsServer = new WebSocketServer({ port: WS_PORT });
  let wsClients: WebSocket[] = [];
  Logger.info(`📡 WebSocket Server running on ws://localhost:${WS_PORT}`);

  wsServer.on("connection", handleWebSocketServerConnection);

  function handleWebSocketServerConnection(ws: WebSocket) {
    Logger.info("✅ Frontend WebSocket connected!");
    wsClients.push(ws);

    ws.on("message", handleWebSocketClientMessage);

    ws.on("close", () => {
      Logger.info("❌ WebSocket client disconnected!");
      wsClients = wsClients.filter((client) => client !== ws);
    });
  }

  function handleWebSocketClientMessage(message: WebSocket.RawData) {
    const event = JSON.parse(message.toString());
    switch (event.type) {
      case "MINE_BLOCK":
        safePublish(BLOCKCHAIN_TOPIC, event);
        break;
      case "UPDATE_BLOCK":
        safePublish(BLOCKCHAIN_TOPIC, event);
        break;
      case "CREATE_BLOCK":
        safePublish(BLOCKCHAIN_TOPIC, event);
        break;
      default:
        Logger.warn("Unknown message type");
    }
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
    } catch (error) {
      Logger.error(`❌ Error publishing to ${topic}: ${error}`);
    }
  }
})();
