import crypto from "crypto";

class Block {
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
    while (
      this.hash.substring(0, difficult) != Array(difficult + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  get isValid() {
    return;
  }
}

class Blockchain {
  private _chain: Block[];
  difficulty: number;

  constructor() {
    this._chain = [this.createGenesisBlock()];
    this.difficulty = 4;
  }

  private createGenesisBlock() {
    return new Block("Genesis Block", 0, "0");
  }

  getLatestBlock() {
    return this._chain[this._chain.length - 1];
  }

  createAndBlock(data: any): void {
    const newBlock = new Block(data);
    newBlock.index = this._chain.length;
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mine(this.difficulty);
    this._chain.push(newBlock);
  }

  addBlock(newBlock: Block): void {
    newBlock.index = this._chain.length;
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mine(this.difficulty);
    this._chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 0; i < this._chain.length; i++) {
      const currentBlock = this._chain[i];
      const previousBlock = this._chain[i - 1];

      if (currentBlock.hash != currentBlock.calculateHash()) {
        return false;
      }

      if (previousBlock && currentBlock.previousHash != previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  get chain() {
    return {
      blocks: this._chain,
      valid: this.isChainValid(),
    };
  }

  get lenght() {
    return this._chain.length;
  }
}

export { Blockchain, Block };
