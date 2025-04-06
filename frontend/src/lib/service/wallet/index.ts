import type { WalletAdapter } from './WalletAdapter';

let currentAdapter: WalletAdapter | null = null;

type ChainType = 'ethereum' | 'solana';

export interface WalletData {
	logo: string | null;
	name: string | null;
	chain: ChainType | null;
	publicKey: string | null;
	connected: boolean;
}

export async function signMessage(message: string): Promise<Uint8Array> {
	if (!currentAdapter) throw new Error('Wallet not connected');
	const signature = await currentAdapter.signMessage(message);
	//const publicKey = await currentAdapter.connect();
	return signature;
}
