import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import { noise } from "@chainsafe/libp2p-noise";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { yamux } from "@chainsafe/libp2p-yamux";
import { identify } from "@libp2p/identify";
import { mdns } from "@libp2p/mdns";
import { WebSocketServer, WebSocket } from "ws";
import { Logger } from "../../utils/logger.js";
import { EventType, NodeEvent, NodeMessage } from "../node-event.js";
import { safePublish } from "./p2p-server-node.js";
import { Topics } from "./p2p-topic.js";

const WS_PORT = 5000;

//Create libp2p node
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
await node.services.pubsub.subscribe(Topics.BLOCKCHAIN);
Logger.info(`📡 Subscribed to blockchain topic`);

node.services.pubsub.addEventListener("message", handleEvent);

function handleEvent(message: any) {
  const event = JSON.parse(
    new TextDecoder().decode(message.detail.data)
  ) as NodeEvent;

  Logger.info(`📩 Received event from node: ${event.type} : ${event.id}`);

  notifyWebSocketClients(event);
}

function notifyWebSocketClients(event: NodeEvent) {
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

  safePublish(Topics.BLOCKCHAIN, {
    type: EventType.REQUEST_SYNC_BLOCKCHAIN,
    data: 1,
  });
}

function handleWebSocketClientMessage(message: WebSocket.RawData) {
  const event = JSON.parse(message.toString()) as NodeMessage;
  Logger.info(`📩 Received event from client: ${JSON.stringify(event)}`);

  switch (event.type) {
    case "CREATE_BLOCK":
    //case "UPDATE_BLOCK":
    case "MINE_BLOCK":
      safePublish(Topics.BLOCKCHAIN, event);
      break;
    default:
      Logger.warn(`Unknown or unnacpeted message type: ${event.type}`);
  }
}
