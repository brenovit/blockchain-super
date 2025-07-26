import { writable } from 'svelte/store';
import type { Block, Blockchain } from '$lib/service/blockchain/model/blockchain';

export const blockchainStore = writable<Blockchain>({
	chain: [],
	status: { valid: true, errors: [] }
});

export const blockStore = writable<Block | null>(null);
