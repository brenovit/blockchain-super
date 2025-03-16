import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid"; // Import UUID generator
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Logger } from "./logger.js";
import { BlockchainService } from "./blockchain-service.js";

const clients = new Map<string, WebSocket>(); // Store clients with their unique IDs

const wss = new WebSocketServer({ port: 3002 });

const blockchain = new BlockchainService(3002);

wss.on("connection", (ws) => {
  const clientId = uuidv4(); // Generate a unique ID for the client
  clients.set(clientId, ws);

  Logger.info(`✅ Client connected: ${clientId}`);

  // Send the entire blockchain to the newly connected client and its id
  ws.send(JSON.stringify({ type: "BLOCKCHAIN", data: blockchain.data }));
  ws.send(JSON.stringify({ type: "CLIENT_ID", data: clientId }));

  ws.on("message", (message) => {
    Logger.debug(`Received message => ${message}`);

    // Send the entire blockchain to the newly connected client
    ws.send(JSON.stringify({ type: "BLOCKCHAIN", data: blockchain.data }));

    const event = JSON.parse(message.toString());
    if (!clients.has(event.clientId)) {
      console.log("Client not found");
      return;
    }
    switch (event.type) {
      case "BLOCKCHAIN":
        ws.send(JSON.stringify({ type: "BLOCKCHAIN", data: blockchain.data }));
        break;
      case "CREATE_BLOCK":
        blockchain.createBlock({
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
    Logger.warn(`❌ Client disconnected: ${clientId}`);
    clients.delete(clientId);
  });
});

console.log(`WebSocket server running on ws://localhost:3002`);

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/blockchain", (req, res) => {
  res.json(blockchain.data);
});

app.post("/create-block", (req: any, res: any) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ error: "Data is required" });
  }

  const newBlock = blockchain.createBlock(data);
  res.json(newBlock);
});

app.post("/mine-block/:index", (req: any, res: any) => {
  const index = req.params["index"];
  if (!index) {
    return res.status(400).json({ error: "index is required" });
  }

  const minedBlock = blockchain.mineBlock(index);
  res.json(minedBlock);
});

app.post("/update-block", (req: any, res: any) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ error: "Data is required" });
  }

  const minedBlock = blockchain.updateBlock(data);
  res.json(minedBlock);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(
    `Blockchain server running on http://localhost:${PORT}/blockchain`
  );
});
