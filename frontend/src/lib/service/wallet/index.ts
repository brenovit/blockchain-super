type ChainType = 'ethereum' | 'solana';

export interface WalletData {
	logo: string | null;
	name: string | null;
	chain: ChainType | null;
	publicKey: string | null;
	connected: boolean;
	signMessage(message: string): Promise<string>;
}
