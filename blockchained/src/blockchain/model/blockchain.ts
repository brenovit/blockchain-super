interface BlockTransation {
  data: any;
  signer: string;
  signature: string;
  nodeId: string;
}

export class Block {
  index: number;
  timestamp: string;
  transation: BlockTransation;
  previousHash: string;
  hash: string = "";
  nonce: number;
  valid: boolean;

  constructor(
    transation: BlockTransation,
    index = 0,
    timestamp = new Date().toISOString(),
    previousHash = ""
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.transation = transation;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.valid = true;
  }
}

export class Blockchain {
  chain: Block[];
  difficulty: number;

  constructor(chain: Block[], difficulty = 2) {
    this.chain = chain;
    this.difficulty = difficulty;
  }

  add(block: Block) {
    this.chain.push(block);
  }

  replace(chain: Block[]) {
    this.chain = chain;
  }
}
