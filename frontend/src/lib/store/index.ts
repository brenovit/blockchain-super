// store.js
import { writable } from 'svelte/store';
import type { Blockchain } from '$lib/service/blockchain/model/blockchain';
import type { WalletData } from '$lib/service/wallets';

interface AppStore {
	//clientId: string;
	connectedWallet: WalletData;
}

export const appStore = writable<AppStore>({
	//clientId: '',
	connectedWallet: {
		logo: '',
		name: '',
		publicKey: ''
	}
});

export const blockchainStore = writable<Blockchain>({
	chain: [],
	status: { valid: true, errors: [] }
});
