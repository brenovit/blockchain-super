import { walletStore } from '$lib/store/walletStore';
import Onboard from '@web3-onboard/core';
import injectedWalletsModule from '@web3-onboard/injected-wallets';
import type { WalletData } from '..';

let connectedWallet: WalletData | null;

walletStore.subscribe((value) => {
	connectedWallet = value;
});

const injected = injectedWalletsModule();

const wallets = [injected];

const onboard = Onboard({
	wallets: wallets,
	chains: [
		{
			id: '0x2105',
			token: 'ETH',
			label: 'Base',
			rpcUrl: 'https://mainnet.base.org'
		}
	],
	connect: {
		showSidebar: false,
		autoConnectAllPreviousWallet: false,
		autoConnectLastWallet: false,
		removeIDontHaveAWalletInfoLink: true

		//removeWhereIsMyWalletWarning: true
	},
	accountCenter: {
		hideTransactionProtectionBtn: true,
		desktop: {
			enabled: false
		},
		mobile: {
			enabled: false
		}
	}
});

export async function connectToWallet() {
	const wallets = await onboard.connectWallet();
	if (wallets.length > 0) {
		const wallet = wallets[0];
		const account = wallet.accounts[0];
		const publicKey = account.address;
		walletStore.set({
			connected: true,
			publicKey: account.address,
			logo: wallets[0].icon,
			name: wallet.label,
			chain: 'ethereum'
		});
	} else {
		throw new Error('No wallet connected');
	}
}

export async function signMessage(message: string): Promise<string> {
	const signature = getProvider()
		.request({
			method: 'eth_sign',
			params: [connectedWallet?.publicKey, message]
		})
		.then((result: any) => {
			return result;
		})
		.catch((error: any) => {
			console.error('Error signing message:', error);
			throw new Error('Failed to sign message');
		});

	return signature;
}

export async function disconnectWallet() {
	await getProvider().disconnect;
	walletStore.set({ connected: false, publicKey: null, name: null, chain: null, logo: null });
}

function getProvider() {
	if (connectedWallet === null) {
		throw new Error('No wallet connected');
	}

	const wallets = onboard.state.get().wallets;
	if (wallets.length === 0) {
		throw new Error('No wallet connected');
	}

	const wallet = wallets[0];
	if (!wallet.provider) {
		throw new Error('Wallet provider is not available');
	}

	return wallet.provider;
}
