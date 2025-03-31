<script lang="ts">
	import { connectWallet, getAvailableWallets, type WalletData } from '$lib/service/wallets';
	import type { WalletAdapter } from '$lib/service/wallets/WalletAdapter';
	import { onMount } from 'svelte';
	import Modal from '../shared/Modal.svelte';
	import { appStore } from '$lib/store';

	let availableWallets: WalletAdapter[] = [];
	let modalRef: Modal;
	let selectedWallet: {
		name: string;
		logo: string;
	} | null = null;

	let publicKey: string | null = null;
	let connected = false;

	function openModal() {
		modalRef.open();
	}

	onMount(() => {
		availableWallets = getAvailableWallets();
		const dataSaved = localStorage.getItem('connectedWallet');
		if (dataSaved) {
			const data = JSON.parse(dataSaved) as WalletData;
			loadWallet(data);
		}
	});

	async function loadWallet(walletData: any) {
		const key = await connectWallet(walletData.name);
		if (key) {
			selectedWallet = { logo: walletData.logo, name: walletData.name };
			publicKey = key;
			appStore.set({
				connectedWallet: walletData
			});
			connected = true;
		}
	}

	async function connect(wallet: WalletAdapter) {
		try {
			selectedWallet = wallet;
			publicKey = await connectWallet(wallet.name);
			console.log('✅ Connected at:', wallet.name);
			const walletData = {
				logo: wallet.logo,
				name: wallet.name
			};
			appStore.set({
				connectedWallet: {
					...walletData,
					publicKey
				}
			});
			localStorage.setItem('connectedWallet', JSON.stringify(walletData));
			connected = true;
			modalRef.close();
		} catch (err) {
			console.error('❌ Wallet connection failed:', err);
		}
	}

	function disconnect() {
		publicKey = null;
		connected = false;
		selectedWallet = null;
		localStorage.removeItem('connectedWallet');
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
	<button type="button" class="btn btn-outline-secondary" on:click={openModal}>Connect</button>
{/if}

<!-- Modal Component -->
<Modal bind:this={modalRef} id="walletModal" title="Select a Wallet">
	<div slot="body">
		{#each availableWallets as wallet}
			<button
				class="btn btn-outline-secondary d-flex align-items-center justify-content-start w-100 mb-2"
				on:click={() => connect(wallet)}
			>
				<img src={wallet.logo} alt={wallet.name} width="24" height="24" class="me-2" />
				{wallet.name}
			</button>
		{/each}
	</div>

	<div slot="footer">
		<button class="btn btn-secondary" on:click={() => modalRef.close()}>Cancel</button>
	</div>
</Modal>
