export interface BlockchainStatus {
	valid: boolean;
	errors: string[];
}

export interface Blockchain {
	chain: Block[];
	status: BlockchainStatus;
}

interface BlockTransaction {
	data: any;
	signer: string;
	signature: string;
	network: string;
	nodeId: string;
}

export interface Block {
	index: number;
	timestamp: string;
	transaction: BlockTransaction;
	previousHash: string;
	hash: string;
	nonce: number;
	valid: boolean;
	signer: string;
	signature: string;
}

export type BlockchainSendEvent = {
	type: BlockchainEventType | undefined;
	data: any;
};

export type BlockchainReceiveEvent = {
	type: BlockchainEventType | undefined;
	data: any;
	id: string;
};

export type BlockchainEventType =
	| 'MASTER_ANNOUNCEMENT'
	| 'ELECTION'
	| 'REQUEST_SYNC_BLOCKCHAIN'
	| 'BLOCKCHAIN_UPDATE'
	| 'ADD_BLOCK'
	| 'CREATE_BLOCK'
	| 'UPDATE_BLOCK'
	| 'MINE_BLOCK'
	| 'CLIENT_ID'
	| 'BLOCKCHAIN';
