import { writable } from 'svelte/store';
import type { Blockchain } from '$lib/service/blockchain/model/blockchain';

export const blockchainStore = writable<Blockchain>({
	chain: [],
	status: { valid: true, errors: [] }
});
