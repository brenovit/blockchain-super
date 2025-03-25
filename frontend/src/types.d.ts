// src/types.d.ts

interface EthereumProvider {
	isMetaMask?: boolean;
	request: (args: { method: string; params?: any[] }) => Promise<any>;
}

interface SolanaProvider {
	isPhantom?: boolean;
	publicKey: {
		toString(): string;
	};
	connect: () => Promise<{ publicKey: { toString(): string } }>;
	signMessage: (
		message: Uint8Array,
		encoding: string
	) => Promise<{ signature: Uint8Array; publicKey: { toString(): string } }>;
}

interface Window {
	ethereum?: EthereumProvider;
	solana?: SolanaProvider;
}
