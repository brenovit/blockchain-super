import type { WalletAdapter } from './WalletAdapter';
import logo from '$lib/assets/icons/Coinbase-icon.svg';

export class CoinbaseAdapter implements WalletAdapter {
	name = 'Coinbase';

	logo = logo;
	isAvailable(): boolean {
		return (
			(typeof window !== 'undefined' &&
				typeof window.ethereum !== 'undefined' &&
				!!window.ethereum.providerMap.keys().find((x) => x === 'CoinbaseWallet')) ||
			'coinbaseSolana' in window
		);
	}

	async connect(): Promise<string> {
		await window.coinbaseSolana?.connect();
		const publicKey = window.coinbaseSolana?.publicKey?.toString();
		if (!publicKey) {
			throw new Error('Failed to retrieve public key from Coinbase Solana.');
		}
		return publicKey;
	}

	async disconnect(): Promise<boolean> {
		await window.coinbaseSolana?.disconnect();
		return !!(
			window.coinbaseSolana &&
			window.coinbaseSolana.isConnected == false &&
			window.coinbaseSolana.publicKey == null
		);
	}

	async signMessage(message: string): Promise<Uint8Array> {
		const encoded = new TextEncoder().encode(message);
		const response = await window.coinbaseSolana?.signMessage(encoded);
		if (!response?.signature) {
			throw new Error('Failed to sign message with Coinbase wallet');
		}
		return response.signature;
	}
}
