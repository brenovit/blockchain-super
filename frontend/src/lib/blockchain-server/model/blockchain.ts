import type Block from '$lib/components/block/Block.svelte';

export interface BlockchainStatus {
	valid: boolean;
	errors: string[];
}

export interface Blockchain {
	chain: Block[];
	status: BlockchainStatus;
}
