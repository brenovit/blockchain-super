import crypto from "crypto";
import { StorageService } from "./storage-service.js";
import { Logger } from "./logger.js";

export class Blockchain {
  chain: Block[];
  difficulty: number;

  constructor(chain: Block[], difficulty = 2) {
    this.chain = chain;
    this.difficulty = difficulty;
  }
}

interface BlockData {
  clientId: string;
  data: any;
}

class Block {
  index: number;
  timestamp: string;
  data: BlockData;
  previousHash: string;
  hash: string = "";
  nonce: number;
  valid: boolean;

  constructor(
    data: BlockData,
    index = 0,
    timestamp = new Date().toISOString(),
    previousHash = ""
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.valid = true;
  }
}

class BlockService {
  private difficulty: number;
  constructor(difficulty: number) {
    this.difficulty = difficulty;
  }

  calculateHash({
    index,
    timestamp,
    data,
    previousHash,
    nonce,
  }: Block): string {
    return crypto
      .createHash("sha256")
      .update(index + timestamp + JSON.stringify(data) + previousHash + nonce)
      .digest("hex");
  }

  async mine(block: Block): Promise<Block> {
    block.nonce = 0;
    block.hash = this.calculateHash(block);

    const delay = Math.floor(Math.random() * 5000) + 1000; // ⏳ Random delay between 1-5 seconds
    Logger.debug(
      `⏳ Simulating processing time: Waiting ${
        delay / 1000
      } seconds before mining...`
    );

    await new Promise((resolve) => setTimeout(resolve, delay)); // Wait for the random delay

    while (
      block.hash.substring(0, this.difficulty) !=
      Array(this.difficulty + 1).join("0")
    ) {
      block.nonce++;
      block.hash = this.calculateHash(block);
    }
    this.checkValid(block);
    Logger.info(`⛏️ Mined new block: ${block.hash}`);
    return block;
  }

  checkValid(block: Block) {
    block.valid = block.hash == this.calculateHash(block);
  }
}

const FIXED_GENESIS_BLOCK = {
  index: 0,
  timestamp: "1997-23-01T15:40:00.000Z", // ✅ Fixed timestamp
  data: { clientId: "genesis", data: "Genesis Block" }, // ✅ Consistent data
  previousHash: "0",
  nonce: 0,
  hash: "FIXED_HASH", // ✅ Precomputed hash
};

class BlockchainService {
  private _blockchain: Blockchain;

  private blockService: BlockService;
  private storage: StorageService;

  private get chain() {
    return this._blockchain.chain;
  }

  private set chain(chain: Block[]) {
    this._blockchain.chain = chain;
  }

  private get difficulty() {
    return this._blockchain.difficulty;
  }

  constructor(identifier: any) {
    this.storage = new StorageService(identifier);
    this._blockchain = this.createOrLoadBlockchain();
    this.blockService = new BlockService(this.difficulty);
  }

  private createOrLoadBlockchain() {
    const data = this.storage.loadData();
    if (data) {
      return data;
    } else {
      return {
        chain: [],
        difficulty: 2,
      };
    }
  }

  private createGenesisBlock() {
    const block = new Block(
      FIXED_GENESIS_BLOCK.data,
      FIXED_GENESIS_BLOCK.index,
      FIXED_GENESIS_BLOCK.timestamp,
      FIXED_GENESIS_BLOCK.previousHash
    );
    block.hash = this.blockService.calculateHash(block);
    return block;
  }

  startChain() {
    if (this.chain.length === 0) {
      this._blockchain.chain = [this.createGenesisBlock()];
      this.saveChain();
    }
  }

  loadChainFromNetwork(chain: Block[]) {
    this.chain = chain;
    this.saveChain();
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  async createBlock(data: any): Promise<Block> {
    Logger.info("Creating block to add in the chain");
    const newBlock = new Block(data);
    newBlock.index = this.chain.length;
    newBlock.previousHash = this.getLatestBlock().hash;
    const minedBlock = this.blockService.mine(newBlock);
    return minedBlock;
  }

  addBlock(newBlock: Block): boolean {
    Logger.info("Adding block to the chain");
    if (this.isValidNewBlock(newBlock, this.getLatestBlock())) {
      this.chain.push(newBlock);
      Logger.info("Block added");
      this.saveChain();
      this.logChain();
      return true;
    }
    return false;
  }

  private isValidNewBlock(newBlock: Block, previousBlock: Block) {
    if (newBlock.previousHash !== previousBlock.hash) return false;
    if (newBlock.hash !== this.blockService.calculateHash(newBlock))
      return false;
    return true;
  }

  mineBlock(index: number) {
    Logger.info("Mining block: " + index);
    const block = this.chain[index];
    this.blockService.mine(block);
    Logger.info("Block mined");

    this.logChain();
    this.saveChain();
    return block;
  }

  updateBlock(payload: any) {
    Logger.info("Updating block: " + JSON.stringify(payload));
    const block = this.chain[payload.index];
    if (!block) {
      Logger.info("Block not found");
      return;
    }
    block.nonce = payload.nonce;
    block.data = payload.data;
    block.previousHash = payload.previousHash;
    this.blockService.checkValid(block);
    Logger.info("Block updated");

    this.logChain();
    this.saveChain();
  }

  private logChain() {
    console.log("<=><=><=><=><=><=><=><=><=><=>");
    console.log(this.chain);
    console.log("<=><=><=><=><=><=><=><=><=><=>");
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
          } is invalid. Calculated hash: ${this.blockService.calculateHash(
            currentBlock
          )}`
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
    this.storage.saveData(this._blockchain);
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

export { BlockchainService, Block };
