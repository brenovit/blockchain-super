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
    console.log("Creating block to add in the chain");
    const newBlock = new Block(data);
    newBlock.index = this._chain.length;
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mine(this.difficulty);
    this._chain.push(newBlock);
    console.log("Block created and added");

    console.log("<=><=><=><=><=><=><=><=><=><=>");
    console.log(this._chain);
    console.log("<=><=><=><=><=><=><=><=><=><=>");
  }

  addBlock(newBlock: Block): void {
    console.log("Adding block to the chain");
    newBlock.index = this._chain.length;
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mine(this.difficulty);
    this._chain.push(newBlock);
    console.log("Block added");

    console.log("<=><=><=><=><=><=><=><=><=><=>");
    console.log(this._chain);
    console.log("<=><=><=><=><=><=><=><=><=><=>");
  }

  mineBlock(index: number) {
    console.log("Mining block: " + index);
    const block = this._chain[index];
    block.mine(this.difficulty);
    console.log("Block mined");

    console.log("<=><=><=><=><=><=><=><=><=><=>");
    console.log(this._chain);
    console.log("<=><=><=><=><=><=><=><=><=><=>");
  }

  updateBlock(payload: any) {
    console.log("Updating block: " + payload.index);
    const block = this._chain[payload.index];
    block.nonce = payload.nonce;
    block.data = payload.data;
    block.previousHash = payload.previousHash;
    block.checkValid();
    console.log("Block updated");

    console.log("<=><=><=><=><=><=><=><=><=><=>");
    console.log(this._chain);
    console.log("<=><=><=><=><=><=><=><=><=><=>");
  }

  getChainStatus() {
    const errors: string[] = [];
    for (let i = 0; i < this._chain.length; i++) {
      const currentBlock = this._chain[i];
      const previousBlock = this._chain[i - 1];

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

  get data() {
    return {
      chain: this._chain,
      status: this.getChainStatus(),
    };
  }

  get lenght() {
    return this._chain.length;
  }
}

export { Blockchain, Block };
