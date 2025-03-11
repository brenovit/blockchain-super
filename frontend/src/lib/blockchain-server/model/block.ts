interface BlockData {
	clientId: string;
	data: any;
}
export interface Block {
	index: number;
	timestamp: string;
	data: BlockData;
	previousHash: string;
	hash: string;
	nonce: number;
	valid: boolean;
}
