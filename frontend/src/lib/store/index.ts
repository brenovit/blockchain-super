// store.js
import { writable } from 'svelte/store';
import type { Blockchain } from '$lib/blockchain-server/model/blockchain';

interface AppStore {
	clientId: string;
}

export const appStore = writable<AppStore>({
	clientId: ''
});

export const blockchainStore = writable<Blockchain>({
	chain: [],
	status: { valid: true, errors: [] }
});
