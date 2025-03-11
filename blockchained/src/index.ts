import crypto from "crypto";
import { saveData, loadData } from "./db";

interface Blockchain {
  chain: Block[];
  difficulty: number;
}

interface BlockData {
  index: number;
  timestamp: string;
  data: any;
  previousHash: string;
  hash: string;
  nonce: number;
  valid: boolean;
}

class Block implements BlockData {
  index: number;
  timestamp: string;
  data: any;
  previousHash: string;
  hash: string;
  nonce: number;
  valid: boolean;

  constructor(data: any, index = 0, previousHash = "") {
    this.index = index;
    this.timestamp = new Date().toISOString();
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
    this.valid = true;
  }

  calculateHash(): string {
    return crypto
      .createHash("sha256")
      .update(
        this.index +
          this.timestamp +
          JSON.stringify(this.data) +
          this.previousHash +
          this.nonce
      )
      .digest("hex");
  }

  mine(difficult: number): void {
    this.nonce = 0;
    this.hash = this.calculateHash();
    while (
      this.hash.substring(0, difficult) != Array(difficult + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    this.checkValid();
  }

  checkValid() {
    this.valid = this.hash == this.calculateHash();
  }
}

class BlockchainService {
  //private _chain: Block[];
  //difficulty: number;

  private _blockchain: Blockchain;

  private get chain() {
    return this._blockchain.chain;
  }

  private get difficulty() {
    return this._blockchain.difficulty;
  }

  constructor() {
    this._blockchain = this.createOrLoadBlockchain();
  }

  private createOrLoadBlockchain() {
    const data = loadData();
    if (data) {
      return data;
    } else {
      this._blockchain = {
        chain: [this.createGenesisBlock()],
        difficulty: 2,
      };
      this.saveChain();
      return this._blockchain;
    }
  }

  private createGenesisBlock() {
    return new Block("Genesis Block", 0, "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  createAndBlock(data: any): void {
    console.log("Creating block to add in the chain");
    const newBlock = new Block(data);
    newBlock.index = this.chain.length;
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mine(this.difficulty);
    this.chain.push(newBlock);
    console.log("Block created and added");

    console.log("<=><=><=><=><=><=><=><=><=><=>");
    console.log(this.chain);
    console.log("<=><=><=><=><=><=><=><=><=><=>");
    this.saveChain();
  }

  addBlock(newBlock: Block): void {
    console.log("Adding block to the chain");
    newBlock.index = this.chain.length;
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mine(this.difficulty);
    this.chain.push(newBlock);
    console.log("Block added");

    console.log("<=><=><=><=><=><=><=><=><=><=>");
    console.log(this.chain);
    console.log("<=><=><=><=><=><=><=><=><=><=>");
    this.saveChain();
  }

  mineBlock(index: number) {
    console.log("Mining block: " + index);
    const block = this.chain[index];
    block.mine(this.difficulty);
    console.log("Block mined");

    console.log("<=><=><=><=><=><=><=><=><=><=>");
    console.log(this.chain);
    console.log("<=><=><=><=><=><=><=><=><=><=>");
    this.saveChain();
  }

  updateBlock(payload: any) {
    console.log("Updating block: " + payload.index);
    const block = this.chain[payload.index];
    block.nonce = payload.nonce;
    block.data = payload.data;
    block.previousHash = payload.previousHash;
    block.checkValid();
    console.log("Block updated");

    console.log("<=><=><=><=><=><=><=><=><=><=>");
    console.log(this.chain);
    console.log("<=><=><=><=><=><=><=><=><=><=>");
    this.saveChain();
  }

  getChainStatus() {
    const errors: string[] = [];
    for (let i = 0; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.valid) {
        errors.push(
          `The block #${
            currentBlock.index
          } is invalid. Calculated hash: ${currentBlock.calculateHash()}`
        );
      }

      if (previousBlock && currentBlock.previousHash != previousBlock.hash) {
        errors.push(
          `The block #${currentBlock.index} is pointing to an inexistent block. The hash does not match with previous block #${previousBlock.index}`
        );
      }
    }
    return {
      valid: errors.length == 0,
      errors: errors,
    };
  }

  private saveChain() {
    saveData(this._blockchain);
  }

  get data() {
    return {
      chain: this.chain,
      status: this.getChainStatus(),
    };
  }

  get lenght() {
    return this.chain.length;
  }
}

export { BlockchainService, Blockchain, BlockData };
