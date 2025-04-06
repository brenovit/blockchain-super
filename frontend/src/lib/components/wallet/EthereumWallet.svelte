<script lang="ts">
	import { connectWallet, disconnectSelectedWallet } from '$lib/service/wallets';
	import { onMount } from 'svelte';
	import { appStore } from '$lib/store';
	import Onboard from '@web3-onboard/core';
	import type { OnboardAPI } from '@web3-onboard/core';
	import injectedWalletsModule from '@web3-onboard/injected-wallets';
	const injected = injectedWalletsModule();

	const wallets = [injected];
	let onboard: OnboardAPI | null = null;

	let selectedWallet: {
		name: string;
		logo: string;
	} | null = null;

	let publicKey: string | null = null;
	let connected = false;

	async function connect() {
		try {
			const wallets = await onboard?.connectWallet();

			if (wallets && wallets[0]) {
				const wallet = wallets[0];
				console.log(wallet);

				publicKey = wallet.accounts[0].address;
				selectedWallet = {
					name: wallet.label,
					logo: wallet.icon
				};

				connected = true;
			}
		} catch (err) {
			console.error('❌ Wallet connection failed:', err);
			connected = false;
		}
	}

	function disconnect() {
		publicKey = null;
		connected = false;
		selectedWallet = null;
		localStorage.removeItem('connectedWallet');
		disconnectSelectedWallet();
	}

	onMount(() => {
		/*const dataSaved = localStorage.getItem('connectedWallet');
		if (dataSaved) {
			const data = JSON.parse(dataSaved) as WalletData;
			console.log(`Found wallet on local storage ${data.name}`);
			loadWallet(data);
		}*/
		if (!onboard) {
			onboard = Onboard({
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
				}
			});
		}
	});

	async function loadWallet(walletData: any) {
		const key = await connectWallet(walletData.name);
		if (key) {
			console.log(`Connected to wallet ${walletData.name}`);

			selectedWallet = { logo: walletData.logo, name: walletData.name };
			publicKey = key;
			appStore.set({
				connectedWallet: {
					...selectedWallet,
					publicKey: key
				}
			});
			connected = true;
		}
	}
</script>

{#if connected}
	<div class="d-flex align-items-center gap-2">
		<img
			src={selectedWallet?.logo}
			alt={selectedWallet?.name}
			width="24"
			height="24"
			class="me-2"
		/>
		<span class="badge bg-success text-wrap text-break">
			{publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}
		</span>
		<button class="btn btn-sm btn-outline-danger" on:click={disconnect}>Disconnect</button>
	</div>
{:else}
	<button type="button" class="btn btn-outline-secondary" on:click={connect}>Connect Ether</button>
{/if}
