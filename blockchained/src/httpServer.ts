import { BlockchainService } from "./blockchain-service.js";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Logger } from "./logger.js";

const DEFAULT_PORT = 2000;
const argPort = process.argv.slice(2)[0] ?? DEFAULT_PORT;

let blockchain = new BlockchainService(Number(argPort));

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.get("/blockchain", (req, res) => {
  res.json(blockchain.data);
});
const HTTP_PORT = DEFAULT_PORT;
app.listen(HTTP_PORT, () => {
  Logger.info(
    `Blockchain HTTP server running on http://localhost:${HTTP_PORT}/blockchain`
  );
});
