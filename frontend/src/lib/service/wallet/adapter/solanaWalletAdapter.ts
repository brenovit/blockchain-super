import { walletStore } from '$lib/store/walletStore';
import { getWallets } from '@wallet-standard/app';
import bs58 from 'bs58';
import type { WalletData } from '..';

let selectedWallet: any = null;

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

	selectedWallet = wallet;
	if (!('standard:connect' in selectedWallet.features))
		throw new Error('connect feature not found on selectedWallet');

	const feature = selectedWallet?.features['standard:connect'] as {
		connect: () => Promise<any>;
	};
	const wallets = await feature.connect();
	const account = wallets.accounts[0];
	const publicKey = account.address;
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
	walletStore.set({
		connected: false,
		publicKey: null,
		name: null,
		chain: null,
		logo: null,
		signMessage: signMessage
	});
}
