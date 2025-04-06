import crypto from "crypto";
import { StorageService } from "../storage/storage-service.js";
import { Logger } from "../../utils/logger.js";
import { Block, Blockchain } from "../model/blockchain.js";
import { PublicKey } from "@solana/web3.js";
import { verifyMessage } from "ethers";
import bs58 from "bs58";

const FIXED_GENESIS_BLOCK: Block = {
  index: 0,
  timestamp: "1997-23-01T15:40:00.000Z",
  transaction: {
    nodeId: "Genesis",
    data: "Genesis Block",
    signer: "Genesis",
    signature: "Genesis",
    network: "Genesis",
  },
  previousHash: "0",
  hash: "0",
  valid: true,
  nonce: 0,
};

export class BlockchainService {
  private _blockchain: Blockchain;

  private storage: StorageService;
  private identifier: number;

  constructor(identifier: any) {
    this.identifier = identifier;
    this.storage = new StorageService(identifier);
    this._blockchain = this.createOrLoadBlockchain();
  }

  private createOrLoadBlockchain(): Blockchain {
    const data = this.storage.loadData();
    if (data) {
      return data;
    } else {
      const blockchain = new Blockchain([this.createGenesisBlock()], 2);
      this.storage.saveData(blockchain);
      return blockchain;
    }
  }

  private createGenesisBlock() {
    const block = new Block(
      FIXED_GENESIS_BLOCK.transaction,
      FIXED_GENESIS_BLOCK.index,
      FIXED_GENESIS_BLOCK.timestamp,
      FIXED_GENESIS_BLOCK.previousHash
    );
    block.hash = this.generateHash(block);
    return block;
  }

  loadChainFromNetwork(blockchain: Blockchain) {
    this._blockchain = new Blockchain(blockchain.chain, blockchain.difficulty);
    this.saveChain();
  }

  async createBlock(data: any): Promise<Block> {
    Logger.debug("Creating new block to be added in the chain");
    Logger.debug(`Data: ${JSON.stringify(data)}`);
    data.nodeId = this.identifier;
    data.network = this.getNetwork(data);
    const newBlock = new Block(data);
    newBlock.index = this.chain.length;
    newBlock.previousHash = this.getLatestBlock().hash;
    const minedBlock = this.mine(newBlock);
    return minedBlock;
  }

  private getNetwork({ signer, signature, data }: any) {
    Logger.debug(`publicKey: ${signer} | signature: ${signature}`);

    let network = "unknown";
    let valid = false;

    if (!signer && signer.startsWith("0x") && signer.length === 42) {
      network = "ethereum";
      valid = this.verifyEthSignature(JSON.stringify(data), signature, signer);
    } else {
      try {
        const decoded = bs58.decode(signer);
        Logger.debug(`
        decoded: ${decoded} |
        length: ${decoded.toString().length}`);

        //if (decoded.toString().length === 32) {
        new PublicKey(signer); // throws if invalid
        network = "solana";
        valid = this.verifySolanaSignature(
          JSON.stringify(data),
          signature,
          signer
        );
        //}
      } catch (error) {
        Logger.debug(`Error getting solana network: ${JSON.stringify(error)}`);
      }
    }
    Logger.debug(`Network found: ${network}`);
    Logger.debug(`Wallet valid: ${valid}`);

    return network;
  }

  verifyEthSignature(
    message: string,
    signature: string,
    expectedAddress: string
  ): boolean {
    try {
      const recovered = verifyMessage(message, signature);
      return recovered.toLowerCase() === expectedAddress.toLowerCase();
    } catch {
      return false;
    }
  }

  verifySolanaSignature(
    message: string,
    signatureArray: number[],
    publicKeyStr: string
  ): boolean {
    const pubKey = new PublicKey(publicKeyStr);
    const messageBytes = new TextEncoder().encode(message);
    const signature = Uint8Array.from(signatureArray);
    //return pubKey.verify(messageBytes, signature);
    return false;
  }

  addBlock(newBlock: Block): boolean {
    Logger.info(
      `Adding block to the chain: ${newBlock.index} : ${newBlock.hash}`
    );
    if (this.isValid(newBlock)) {
      this.chain.push(newBlock);
      this.saveChain();
      this.logChain();
      return true;
    }
    return false;
  }

  isValid(block: Block) {
    return this.isValidNewBlock(block, this.getLatestBlock());
  }

  private isValidNewBlock(newBlock: Block, previousBlock: Block) {
    Logger.debug(
      `Checking block is valid: ${newBlock.index} : ${newBlock.hash}`
    );
    const currentAndPreviousBlocksHaveSameHash =
      newBlock.previousHash === previousBlock.hash;
    const currentAndPreviousBlockHaveDifferentIndex =
      newBlock.index !== previousBlock.index;
    const currentBlockHasValidHash =
      newBlock.hash === this.generateHash(newBlock);

    Logger.debug(
      `Block status: ${newBlock.index} : ${newBlock.hash}
      | currentAndPreviousBlockHaveSameHash: ${currentAndPreviousBlocksHaveSameHash} 
      | currentAndPreviousBlockHaveDifferentIndex: ${currentAndPreviousBlockHaveDifferentIndex}
      | currentBlockHasValidHash: ${currentBlockHasValidHash}`
    );
    return (
      currentAndPreviousBlocksHaveSameHash &&
      currentAndPreviousBlockHaveDifferentIndex &&
      currentBlockHasValidHash
    );
  }

  /*mineBlock(index: number) {
    Logger.info("Mining block: " + index);
    const block = this.chain[index];
    this.mine(block);
    this.saveChain();
    this.logChain();
    return block;
  }*/

  /*updateBlock(payload: any) {
    Logger.info("Updating block: " + JSON.stringify(payload));
    const block = this.chain[payload.index];
    if (!block) {
      Logger.info("Block not found");
      return;
    }
    block.nonce = payload.nonce;
    block.data = payload.data;
    block.previousHash = payload.previousHash;
    this.checkValid(block);
    Logger.info("Block updated");
    this.saveChain();
    this.logChain();
  }*/

  private generateHash({
    index,
    timestamp,
    transaction,
    previousHash,
    nonce,
  }: Block): string {
    return crypto
      .createHash("sha256")
      .update(
        index + timestamp + JSON.stringify(transaction) + previousHash + nonce
      )
      .digest("hex");
  }

  private async mine(block: Block): Promise<Block> {
    block.nonce = 0;
    block.hash = "";

    const delay = Math.floor(Math.random() * 3000) + 1000; // ⏳ Random delay between 1-3 seconds
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
      if (this.getLatestBlock().hash !== block.previousHash) {
        Logger.warn(`⚠️ Mining stopped: A new valid block was found.`);
        return block; // ✅ Stop mining if another block has been accepted
      }
      block.nonce++;
      block.hash = this.generateHash(block);
    }
    this.checkValid(block);
    Logger.info(`⛏️ Mined new block: ${block.hash}`);
    return block;
  }

  private checkValid(block: Block) {
    block.valid = block.hash == this.generateHash(block);
  }

  private logChain() {
    console.log("<=><=><=><=><=><=><=><=><=><=>");
    console.log(this.chain);
    console.log("<=><=><=><=><=><=><=><=><=><=>");
  }

  private getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  checkChainValid(blockchain: Blockchain) {
    const errors: string[] = [];
    if (blockchain && blockchain.chain) {
      for (let i = 0; i < blockchain.chain.length; i++) {
        const currentBlock = blockchain.chain[i];
        const previousBlock = blockchain.chain[i - 1];

        if (!currentBlock.valid) {
          errors.push(
            `The block #${
              currentBlock.index
            } is invalid. Calculated hash: ${this.generateHash(currentBlock)}`
          );
        }

        if (previousBlock && currentBlock.previousHash != previousBlock.hash) {
          errors.push(
            `The block #${currentBlock.index} is pointing to an inexistent block. The hash does not match with previous block #${previousBlock.index}`
          );
        }
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

  private get chain() {
    return this._blockchain.chain;
  }

  private set chain(chain: Block[]) {
    this._blockchain.replace(chain);
  }

  private get difficulty() {
    return this._blockchain.difficulty;
  }

  get data() {
    return {
      chain: this.chain,
      status: this.checkChainValid(this._blockchain),
      difficulty: this.difficulty,
    };
  }

  get lenght() {
    return this.chain.length;
  }
}
