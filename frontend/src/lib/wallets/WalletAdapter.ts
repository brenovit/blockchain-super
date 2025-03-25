export interface WalletAdapter {
	name: string;
	logo: string;
	connect(): Promise<string>; // wallet address or pubkey
	signMessage(message: string): Promise<Uint8Array>;
	isAvailable(): boolean;
}
