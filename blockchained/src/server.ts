import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Blockchain } from "./index";

const app = express();
const blockchain = new Blockchain();

app.use(cors());
app.use(bodyParser.json());

app.get("/blockchain", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/add-block", (req: any, res: any) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ error: "Data is required" });
  }

  const newBlock = blockchain.createAndBlock(data);
  res.json(newBlock);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Blockchain server running on http://localhost:${PORT}`);
});
