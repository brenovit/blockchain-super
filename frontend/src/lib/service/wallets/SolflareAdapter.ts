import type { WalletAdapter } from './WalletAdapter';
import logo from '$lib/assets/icons/Solflare-icon.svg';

export class SolflareAdapter implements WalletAdapter {
	name = 'Solflare';

	logo = logo;
	isAvailable(): boolean {
		return (
			typeof window !== 'undefined' &&
			('solflare' in window ||
				(typeof window.solana !== 'undefined' && window.solana?.isSolflare === true))
		);
	}

	async connect(): Promise<string> {
		const connected = await window.solflare?.connect();
		console.log('connected: ' + connected);
		if (connected) {
			console.log('publicKey: ' + window.solflare?.publicKey);
		}
		return '';
	}

	disconnect(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	async signMessage(message: string): Promise<Uint8Array> {
		const account = await this.connect();
		const hexMessage = '0x' + Buffer.from(message, 'utf-8').toString('hex');

		const signature = await window.ethereum?.request({
			method: 'personal_sign',
			params: [hexMessage, account]
		});

		// Convert hex string to Uint8Array
		return Uint8Array.from(Buffer.from(signature.slice(2), 'hex'));
	}
}
