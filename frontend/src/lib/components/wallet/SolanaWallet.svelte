<script lang="ts">
	import { onMount } from 'svelte';

	import Modal from '../shared/Modal.svelte';
	import {
		connectToWallet,
		disconnectWallet,
		listWallets
	} from '$lib/service/wallet/adapter/solanaWalletAdapter';
	import ConnectWallet from './ConnectWallet.svelte';
	import type { WalletData } from '$lib/service/wallet';

	let modalRef: Modal;

	let wallets: WalletData[] = [];

	onMount(() => {
		wallets = listWallets();
	});

	function connect() {
		modalRef.open();
	}

	function disconnect() {
		disconnectWallet();
	}

	async function openWallet(wallet: any) {
		try {
			await connectToWallet(wallet.name);
			modalRef.close();
		} catch (err) {
			console.error('❌ Wallet oppening failed:', err);
		}
	}
</script>

<ConnectWallet chain="solana" {connect} {disconnect} />

<!-- Modal Component -->
<Modal bind:this={modalRef} id="walletModal" title="Select a Wallet">
	<div slot="body">
		{#each wallets as wallet}
			<button
				class="btn btn-outline-secondary d-flex align-items-center justify-content-start w-100 mb-2"
				on:click={() => openWallet(wallet)}
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
