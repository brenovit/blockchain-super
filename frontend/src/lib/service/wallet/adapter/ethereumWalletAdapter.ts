import { walletStore } from '$lib/store/walletStore';
import Onboard from '@web3-onboard/core';
import injectedWalletsModule from '@web3-onboard/injected-wallets';
import type { WalletData } from '..';

let connectedWallet: WalletData;

walletStore.subscribe((value) => {
	connectedWallet = value;
});

const injected = injectedWalletsModule();

const onboard = Onboard({
	wallets: [injected],
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
		walletStore.set({
			connected: true,
			publicKey: account.address,
			logo: wallets[0].icon,
			name: wallet.label,
			chain: 'ethereum',
			signMessage: signMessage
		});
	}
}

export async function signMessage(message: string): Promise<string> {
	const accounts = await getProvider().request({
		method: 'eth_accounts'
	});
	const address = accounts[0];
	const hexMessage = '0x' + Buffer.from(message, 'utf8').toString('hex');

	const signature = getProvider()
		.request({
			method: 'personal_sign',
			params: [hexMessage, address]
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
	const [primaryWallet] = onboard.state.get().wallets;
	if (!primaryWallet) {
		throw new Error('No wallet connected');
	}
	await onboard.disconnectWallet({ label: primaryWallet.label });
	walletStore.set({
		connected: false,
		publicKey: null,
		name: null,
		chain: null,
		logo: null,
		signMessage: signMessage
	});
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
