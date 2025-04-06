// src/types.d.ts

interface EthereumProvider {
	providerMap: Map<string, any>;
	isMetaMask?: boolean;
	isCoinbaseWallet?: boolean;
	request: (args: { method: string; params?: any[] }) => Promise<any>;
}

interface SolanaProvider {
	isPhantom?: boolean;
	isSolflare?: boolean;
	isConnected: boolean;
	publicKey: string;
	publicKey: {
		toString(): string;
	};
	connect: () => Promise<{ publicKey: { toString(): string } }>;
	signMessage: (
		message: Uint8Array,
		encoding: string
	) => Promise<{ signature: Uint8Array; publicKey: { toString(): string } }>;
}

interface CoibaseSolana {
	connect: () => Promise<Any>;
	disconnect: () => Promise<Any>;
	isConnected: boolean;
	publicKey: string;
	signMessage: (e) => Promise<Any>;
	request: (args: { method: string; params?: any[] }) => Promise<any>;
}

interface Solflare {
	connect: () => Promise<{ publicKey: { toString(): string } }>;
	disconnect: () => Promise<{ publicKey: { toString(): string } }>;
	signMessage: (t, e) => Promise<{ publicKey: { toString(): string } }>;
	publicKey: string;
}

interface Window {
	ethereum?: EthereumProvider;
	solana?: SolanaProvider;
	solflare?: Solflare;
	isPhantomInstalled?: boolean;
	coinbaseSolana?: CoibaseSolana;
}
