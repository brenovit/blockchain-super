import { MetaMaskAdapter } from './MetaMaskAdapter';
import { PhantomAdapter } from './PhantomAdapter';
import type { WalletAdapter } from './WalletAdapter';

const adapters: WalletAdapter[] = [new MetaMaskAdapter(), new PhantomAdapter()];

let currentAdapter: WalletAdapter | null = null;

export function getAvailableWallets(): WalletAdapter[] {
	return adapters.filter((a) => a.isAvailable());
}

export async function connectWallet(name: string): Promise<string> {
	currentAdapter = adapters.find((a) => a.name === name) || null;
	if (!currentAdapter) throw new Error('Wallet not found or unavailable');
	return currentAdapter.connect();
}

export async function signMessage(
	message: string
): Promise<{ signature: Uint8Array; publicKey: string }> {
	if (!currentAdapter) throw new Error('Wallet not connected');
	const signature = await currentAdapter.signMessage(message);
	const publicKey = await currentAdapter.connect();
	return { signature, publicKey };
}
