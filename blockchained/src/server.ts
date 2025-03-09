import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Blockchain } from "./index";

const app = express();
const blockchain = new Blockchain();

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

  const newBlock = blockchain.createAndBlock(data);
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
  console.log(`Blockchain server running on http://localhost:${PORT}`);
});
