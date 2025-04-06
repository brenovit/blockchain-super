<script lang="ts">
	import { onMount } from 'svelte';

	import { connectWallet, getAvailableWallets, type WalletData } from '$lib/service/wallets';
	import type { WalletAdapter } from '$lib/service/wallets/WalletAdapter';
	import Modal from '../shared/Modal.svelte';
	import { appStore } from '$lib/store';
	import {
		listWallets,
		connectToWallet,
		walletState,
		signMessage,
		disconnectWallet
	} from '$lib/store/solanaWallet';

	let availableWallets: WalletAdapter[] = [];
	let modalRef: Modal;
	let selectedWallet: {
		name: string;
		logo: string;
	} | null = null;

	let publicKey: string | null = null;
	let connected = false;

	let wallets: any[] = [];

	$: $walletState, (connected = $walletState.connected);

	walletState.subscribe((state) => {
		if (state.connected) {
			publicKey = state.publicKey;
		}
	});

	onMount(() => {
		wallets = listWallets();
		availableWallets = getAvailableWallets();
		const dataSaved = localStorage.getItem('connectedWallet');
		if (dataSaved) {
			const data = JSON.parse(dataSaved) as WalletData;
			console.log(`Found wallet on local storage ${data.name}`);
			openWallet(data);
		}
	});

	async function testSign() {
		const sig = await signMessage('hello svelte');
		console.log('🖊️ Signature:', sig);
	}

	function connect() {
		modalRef.open();
	}

	function disconnect() {
		publicKey = null;
		connected = false;
		selectedWallet = null;
		localStorage.removeItem('connectedWallet');
		disconnectWallet();
	}

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

	async function openWallet(wallet: any) {
		try {
			console.log('✅ Connectint to wallet:', wallet.name);
			await connectToWallet(wallet.name);

			console.log('Public key:', publicKey);
			selectedWallet = {
				logo: wallet.icon,
				name: wallet.name
			};
			/*appStore.set({
				connectedWallet: {
					...walletData,
					publicKey
				}
			});*/
			//localStorage.setItem('connectedWallet', JSON.stringify(walletData));
			connected = true;
			modalRef.close();
		} catch (err) {
			console.error('❌ Wallet oppening failed:', err);
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
	<button type="button" class="btn btn-outline-secondary" on:click={connect}>Connect Solana</button>
{/if}

<!-- Modal Component -->
<Modal bind:this={modalRef} id="walletModal" title="Select a Wallet">
	<div slot="body">
		{#each availableWallets as wallet}
			<button
				class="btn btn-outline-secondary d-flex align-items-center justify-content-start w-100 mb-2"
				on:click={() => openWallet(wallet)}
			>
				<img src={wallet.logo} alt={wallet.name} width="24" height="24" class="me-2" />
				{wallet.name}
			</button>
		{/each}
		<hr />
		{#each wallets as wallet}
			<button
				class="btn btn-outline-secondary d-flex align-items-center justify-content-start w-100 mb-2"
				on:click={() => openWallet(wallet)}
			>
				<img src={wallet.icon} alt={wallet.name} width="24" height="24" class="me-2" />
				{wallet.name}
			</button>
		{/each}
	</div>

	<div slot="footer">
		<button class="btn btn-secondary" on:click={() => modalRef.close()}>Cancel</button>
	</div>
</Modal>
