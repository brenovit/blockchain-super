import { getWallets } from '@wallet-standard/app';
import type { Wallet } from '@wallet-standard/base';
import bs58 from 'bs58';
import { writable } from 'svelte/store';

export const walletState = writable<{
	connected: boolean;
	publicKey: string | null;
	name: string | null;
}>({ connected: false, publicKey: null, name: null });

let selectedWallet: any = null;

export function listWallets() {
	const wallets = getWallets();
	return wallets.get().map((w) => ({
		name: w.name,
		icon: w.icon,
		adapter: w
	}));
}

export async function connectToWallet(walletName: string) {
	const wallet = listWallets().find((w) => w.name === walletName);
	if (!wallet) throw new Error('Wallet not found');

	selectedWallet = wallet.adapter;
	if (!('standard:connect' in selectedWallet.features))
		throw new Error('connect feature not found on selectedWallet');

	const feature = selectedWallet?.features['standard:connect'] as {
		connect: () => Promise<any>;
	};
	const response = await feature.connect();
	console.log(response.accounts[0]);
	const account = response.accounts[0];
	const publicKey = account.address;
	walletState.set({ connected: true, publicKey: publicKey, name: walletName });
}

export async function signMessage(message: string): Promise<string> {
	if (!selectedWallet) throw new Error('No wallet connected');
	if (!('standard:signMessage' in selectedWallet.features))
		throw new Error('signMessage feature not found on selectedWallet');

	const encoded = new TextEncoder().encode(message);
	const signature = await selectedWallet.signMessage({ message: encoded });
	return bs58.encode(signature.signature); // return base58 encoded signature
}

export async function disconnectWallet() {
	if (!selectedWallet) throw new Error('No wallet connected');
	if (!('standard:disconnect' in selectedWallet.features))
		throw new Error('disconnect feature not found on selectedWallet');
	const feature = selectedWallet?.features['standard:disconnect'] as {
		disconnect: () => Promise<void>;
	};
	await feature.disconnect();
	selectedWallet = null;
	walletState.set({ connected: false, publicKey: null, name: null });
}
