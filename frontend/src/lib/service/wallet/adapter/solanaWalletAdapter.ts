import { walletStore } from '$lib/store/walletStore';
import { getWallets } from '@wallet-standard/app';
import bs58 from 'bs58';
import type { WalletData } from '..';

let walletState: { features: any; account: any } | null = null;
let connectedWallet: WalletData;

walletStore.subscribe((value) => {
	connectedWallet = value;
});

const chainType = 'solana';

export function listWallets(): WalletData[] {
	const wallets = getWallets();
	return wallets.get().map((w) => ({
		name: w.name,
		logo: w.icon,
		connected: false,
		chain: chainType,
		publicKey: null,
		signMessage: signMessage
	}));
}

export async function connectToWallet(walletName: string) {
	const wallet = getWallets()
		.get()
		.find((w) => w.name === walletName);
	if (!wallet) throw new Error('Wallet not found');

	const feature = wallet.features['standard:connect'] as any;

	if (!feature || typeof feature.connect !== 'function') {
		throw new Error('connect feature not supported by wallet');
	}

	const response = await feature.connect();
	const account = response.accounts[0];
	const publicKey = account.address;
	walletState = { features: wallet.features, account: account };
	walletStore.set({
		connected: true,
		publicKey: publicKey,
		logo: wallet.icon,
		name: walletName,
		chain: chainType,
		signMessage: signMessage
	});
}

export async function signMessage(message: string): Promise<string> {
	if (!walletState) throw new Error('No wallet connected');

	const feature = walletState.features['solana:signMessage'];

	if (!feature || typeof feature.signMessage !== 'function') {
		throw new Error('signMessage feature not supported by wallet');
	}

	const encoded = new TextEncoder().encode(message);
	const [response] = await feature.signMessage({
		account: walletState.account,
		message: encoded
	});
	return bs58.encode(response.signature); // return base58 encoded signature
}

export async function disconnectWallet() {
	if (!walletState) throw new Error('No wallet connected');
	const feature = walletState.features['standard:disconnect'];

	if (!feature || typeof feature.disconnect !== 'function') {
		throw new Error('disconnect feature not supported by wallet');
	}

	await feature.disconnect();
	walletState = null;
	walletStore.set({
		connected: false,
		publicKey: null,
		name: null,
		chain: null,
		logo: null,
		signMessage: signMessage
	});
}
