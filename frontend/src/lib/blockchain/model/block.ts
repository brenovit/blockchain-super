export interface Block {
	index: number;
	timestamp: string;
	data: any;
	previousHash: string;
	hash: string;
	nonce: number;
	valid: boolean;
}
