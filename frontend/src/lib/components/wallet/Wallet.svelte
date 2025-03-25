<script lang="ts">
	import { connectWallet, getAvailableWallets } from '$lib/wallets';
	import type { WalletAdapter } from '$lib/wallets/WalletAdapter';
	import { onMount } from 'svelte';
	import Modal from '../shared/Modal.svelte';

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
			const { _publicKey, _logo, _name } = JSON.parse(dataSaved);
			selectedWallet = { logo: _logo, name: _name };
			publicKey = _publicKey;
			connected = true;
		}
	});

	async function connect(wallet: WalletAdapter) {
		try {
			selectedWallet = wallet;
			publicKey = await connectWallet(wallet.name);
			console.log('✅ Connected to:', publicKey);
			localStorage.setItem(
				'connectedWallet',
				JSON.stringify({
					_logo: wallet.logo,
					_name: wallet.name,
					_publicKey: publicKey
				})
			);
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
