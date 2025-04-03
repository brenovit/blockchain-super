export interface WalletAdapter {
	name: string;
	logo: string;
	connect(): Promise<string>; // wallet address or pubkey
	disconnect(): Promise<boolean>;
	signMessage(message: string): Promise<Uint8Array>;
	isAvailable(): boolean;
}
