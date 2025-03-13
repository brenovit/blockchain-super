import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import { noise } from "@chainsafe/libp2p-noise";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { yamux } from "@chainsafe/libp2p-yamux";
import { identify } from "@libp2p/identify";
import { mdns } from "@libp2p/mdns";
import { WebSocketServer, WebSocket } from "ws";
import { Logger } from "./logger.js";

const WS_PORT = 5000;
const P2P_TOPIC = "blockchain";

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
  node.services.pubsub.subscribe("blockchain");

  node.services.pubsub.addEventListener("message", (message) => {
    const event = JSON.parse(new TextDecoder().decode(message.detail.data));
    Logger.info(
      `📩 Received blockchain event: ${JSON.stringify(event, null, 2)}`
    );

    // ✅ Broadcast blockchain updates to all WebSocket clients
    notifyWebSocketClients(event);
  });

  // ✅ Step 3: Create WebSocket Server for Frontend
  const wsServer = new WebSocketServer({ port: WS_PORT });
  let wsClients: WebSocket[] = [];

  wsServer.on("connection", (ws) => {
    Logger.info("✅ Frontend WebSocket connected!");

    wsClients.push(ws);

    ws.on("message", (message) => {
      const event = JSON.parse(message.toString());
      switch (event.type) {
        case "CREATE_BLOCK":
          node.services.pubsub.publish(
            P2P_TOPIC,
            new TextEncoder().encode(JSON.stringify(event.data))
          );
          break;
        default:
          Logger.info("Unknown message type");
      }
    });

    ws.on("close", () => {
      Logger.info("❌ WebSocket client disconnected!");
      wsClients = wsClients.filter((client) => client !== ws);
    });
  });

  function notifyWebSocketClients(message: any) {
    wsClients.forEach((client) => {
      client.send(JSON.stringify(message));
    });
  }

  Logger.info(`📡 WebSocket Server running on ws://localhost:${WS_PORT}`);
})();
