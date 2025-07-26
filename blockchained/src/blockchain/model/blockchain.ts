interface BlockTransaction {
  data: any;
  signer: string;
  signature: string;
  network: string;
  nodeId: string;
}

export class Block {
  index: number;
  timestamp: string;
  transaction: BlockTransaction;
  previousHash: string;
  hash: string = "";
  nonce: number;

  constructor(
    transaction: BlockTransaction,
    index = 0,
    timestamp = new Date().toISOString(),
    previousHash = ""
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.transaction = transaction;
    this.previousHash = previousHash;
    this.nonce = 0;
  }
}

export class LogicalBlock extends Block {
  valid: boolean;
  errors: string[];

  constructor(block: Block) {
    super(block.transaction, block.index, block.timestamp, block.previousHash);
    this.hash = block.hash;
    this.nonce = block.nonce;
    this.valid = true;
    this.errors = [];
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
