import { writable } from 'svelte/store';

import type { WalletData } from '$lib/service/wallet';

export const walletStore = writable<WalletData>({
	connected: false,
	publicKey: null,
	name: null,
	logo: null,
	chain: null,
	sign: () => {
		throw new Error('Wallet not connected');
	}
});
