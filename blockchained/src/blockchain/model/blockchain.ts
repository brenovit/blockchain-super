interface BlockData {
  clientId: string;
  data: any;
}

export class Block {
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

export class Blockchain {
  private _chain: Block[];
  private _difficulty: number;

  constructor(chain: Block[], difficulty = 2) {
    this._chain = chain;
    this._difficulty = difficulty;
  }

  add(block: Block) {
    this._chain.push(block);
  }

  replace(chain: Block[]) {
    this._chain = chain;
  }

  get chain() {
    return this._chain;
  }

  get difficulty() {
    return this._difficulty;
  }
}
