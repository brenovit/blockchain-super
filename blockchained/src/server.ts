import { WebSocketServer, WebSocket } from "ws";
import { BlockchainService } from "./index";
import { v4 as uuidv4 } from "uuid"; // Import UUID generator
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Logger } from "./logger";
const DEFAULT_PORT = 5000;

let blockchain: BlockchainService;

const clients = new Map<string, WebSocket>(); // Store clients with their unique IDs

const argPort = process.argv.slice(2)[0] ?? DEFAULT_PORT;

const WSS_PORT = Number(argPort);
Logger.info(`🚀 Starting server on port ${WSS_PORT}`);

const peers: WebSocket[] = [];
const knownPeers = new Set<string>();

startWebSocketServer(WSS_PORT);

function startWebSocketServer(port: number) {
  blockchain = new BlockchainService(port);
  const wss = new WebSocketServer({ port });

  wss.on("connection", (ws) => {
    peers.push(ws);
    Logger.info("🔗 New client connected");

    ws.on("message", (message) => {
      Logger.info(`📩 Received message on server: ${message}`);

      const event = JSON.parse(message.toString());

      switch (event.type) {
        case "SYNC_BLOCKCHAIN":
          ws.send(
            JSON.stringify({ type: "SYNC_BLOCKCHAIN", data: blockchain.data })
          );
          break;
        case "NEW_PEER":
          discoverPeer(event.data.peerUrl);
          break;
        case "CREATE_BLOCK":
          blockchain.createAndBlock({
            data: event.data,
            clientId: event.clientId,
          });
          sendBlockchain();
          break;
        case "MINE_BLOCK":
          blockchain.mineBlock(event.data);
          sendBlockchain();
          break;
        case "UPDATE_BLOCK":
          blockchain.updateBlock({
            ...event.data,
            data: {
              data: event.data.data,
              clientId: event.clientId,
            },
          });
          sendBlockchain();
          break;
        default:
          Logger.info("Unknown message type");
      }

      function sendBlockchain() {
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(
              JSON.stringify({ type: "BLOCKCHAIN", data: blockchain.data })
            );
          }
        });
      }
    });

    ws.on("close", () => {
      Logger.warn("❌ Peer disconnected");
      peers.splice(peers.indexOf(ws), 1);
    });

    //When a new client connects, send the blockchain to the client
    sendBlockchain(ws);
    broadcastNewPeer(`ws://localhost:${port}`);
  });

  if (port !== DEFAULT_PORT) {
    //Send yourself to others servers listening
    discoverPeer("ws://localhost:5000");
  } else {
  }
}

function broadcastNewPeer(peerUrl: string) {
  Logger.info(`🌍 Broadcasting new peer: ${peerUrl}`);
  peers.forEach((peer) => {
    peer.send(JSON.stringify({ type: "NEW_PEER", data: { peerUrl } }));
  });
}

function sendBlockchain(ws: WebSocket) {
  ws.send(JSON.stringify({ type: "SYNC_BLOCKCHAIN", data: blockchain.data }));
}

function discoverPeer(peerUrl: string) {
  if (!knownPeers.has(peerUrl)) {
    Logger.info(`🌍 Discovering new peer: ${peerUrl}`);
    connectToPeer(peerUrl);
  }
}

function connectToPeer(peerUrl: string) {
  if (knownPeers.has(peerUrl)) return; // Avoid duplicate connections
  knownPeers.add(peerUrl);

  const ws = new WebSocket(peerUrl);

  ws.on("open", () => {
    Logger.info(`✅ Discovered and connected to new peer: ${peerUrl}`);
    peers.push(ws);
    //sendBlockchain(ws);
    //broadcastNewPeer(peerUrl);
  });

  ws.on("close", () => {
    Logger.warn(`❌ Disconnected from peer: ${peerUrl}`);
    knownPeers.delete(peerUrl);
    const index = peers.indexOf(ws);
    if (index !== -1) {
      peers.splice(index, 1);
    }
  });

  ws.on("message", (message) => {
    Logger.info(`📩 Received message on client: ${message}`);

    const event = JSON.parse(message.toString());

    if (event.type === "SYNC_BLOCKCHAIN") {
      //block;
    } else if (event.type === "ADD_BLOCK") {
      //const newBlock = Block.fromJSON(data.block);
      //blockchain.addBlock(newBlock);
      broadcastBlockchain();
    } else if (event.type === "NEW_PEER") {
      discoverPeer(event.data.peerUrl);
    }
  });

  ws.on("error", (error) => {
    Logger.error(
      `Error connecting to peer ${peerUrl}: ${JSON.stringify(error)}`
    );
  });
}

function broadcastBlockchain() {
  const message = JSON.stringify({
    type: "SYNC_BLOCKCHAIN",
    data: blockchain.data,
  });
  peers.forEach((peer) => peer.send(message));
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.get("/blockchain", (req, res) => {
  res.json(blockchain.data);
});
const HTTP_PORT = WSS_PORT - 2000;
app.listen(HTTP_PORT, () => {
  Logger.debug(
    `Blockchain HTTP server running on http://localhost:${HTTP_PORT}/blockchain`
  );
});
