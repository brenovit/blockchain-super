import type { WalletAdapter } from './WalletAdapter';
import logo from '$lib/assets/icons/MetaMask-icon.svg';

export class MetaMaskAdapter implements WalletAdapter {
	name = 'MetaMask';
	logo = logo;

	isAvailable(): boolean {
		return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
	}

	async connect(): Promise<string> {
		const [address] = await window.ethereum?.request({ method: 'eth_requestAccounts' });
		return address;
	}

	async signMessage(message: string): Promise<Uint8Array> {
		const from = await this.connect();
		const hex = '0x' + Buffer.from(message, 'utf-8').toString('hex');
		const signature = await window.ethereum?.request({
			method: 'personal_sign',
			params: [hex, from]
		});
		return Uint8Array.from(Buffer.from(signature.slice(2), 'hex'));
	}
}
