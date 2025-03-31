import type { WalletAdapter } from './WalletAdapter';
import logo from '$lib/assets/icons/Phantom-icon.svg';

export class PhantomAdapter implements WalletAdapter {
	name = 'Phantom';
	logo = logo;
	isAvailable(): boolean {
		return typeof window !== 'undefined' && typeof window.solana !== 'undefined';
	}

	async connect(): Promise<string> {
		const resp = await window.solana?.connect();
		if (!resp?.publicKey) {
			throw new Error('Failed to connect to Phantom wallet');
		}
		return resp.publicKey.toString();
	}

	async signMessage(message: string): Promise<Uint8Array> {
		const encoded = new TextEncoder().encode(message);
		const response = await window.solana?.signMessage(encoded, 'utf8');
		if (!response?.signature) {
			throw new Error('Failed to sign message with Phantom wallet');
		}
		return response.signature;
	}
}
