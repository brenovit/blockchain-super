import { CoinbaseAdapter } from './CoinbaseAdapter';
import { MetaMaskAdapter } from './MetaMaskAdapter';
import { PhantomAdapter } from './PhantomAdapter';
import { SolflareAdapter } from './SolflareAdapter';
import type { WalletAdapter } from './WalletAdapter';

const adapters: WalletAdapter[] = [
	new MetaMaskAdapter(),
	new PhantomAdapter(),
	new CoinbaseAdapter(),
	new SolflareAdapter()
];

let currentAdapter: WalletAdapter | null = null;

export interface WalletData {
	logo: string;
	name: string;
	publicKey: string;
}

export function getAvailableWallets(): WalletAdapter[] {
	return adapters.filter((a) => a.isAvailable());
}

export async function connectWallet(name: string): Promise<string> {
	currentAdapter = adapters.find((a) => a.name === name) || null;
	if (!currentAdapter) throw new Error('Wallet not found or unavailable');
	return currentAdapter.connect();
}

export async function disconnectSelectedWallet(): Promise<boolean> {
	if (!currentAdapter) throw new Error('Wallet not found or unavailable');
	return currentAdapter.disconnect();
}

export async function signMessage(message: string): Promise<Uint8Array> {
	if (!currentAdapter) throw new Error('Wallet not connected');
	const signature = await currentAdapter.signMessage(message);
	//const publicKey = await currentAdapter.connect();
	return signature;
}
