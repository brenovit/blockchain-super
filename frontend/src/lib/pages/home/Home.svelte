<script lang="ts">
	import Block from '$lib/components/block/Block.svelte';
	import { BlockchainServer } from '$lib/service/blockchain/blockchain-server';
	import type { BlockchainStatus } from '$lib/service/blockchain/model/blockchain';
	import { blockchainStore } from '$lib/store/blockchainStore';
	import { walletStore } from '$lib/store/walletStore';
	import { onDestroy } from 'svelte';
	import Wallet from '$lib/components/wallet/SolanaWallet.svelte';
	import type { WalletData } from '$lib/service/wallet';
	import EthereumWallet from '$lib/components/wallet/EthereumWallet.svelte';
	import SolanaWallet from '$lib/components/wallet/SolanaWallet.svelte';

	const server = BlockchainServer.getInstance();

	let blockchain: any[] = [];
	let blockChainStatus: BlockchainStatus = { valid: true, errors: [] };
	let data = '';
	let connectedWallet: WalletData;

	walletStore.subscribe((value) => {
		connectedWallet = value;
	});
	blockchainStore.subscribe((value) => {
		blockchain = value.chain.sort((a, b) => b.index - a.index);
		blockChainStatus = value.status;
	});

	$: creationDisabled = !(connectedWallet && connectedWallet.connected);

	async function createBlock() {
		if (!data) return;

		if (!connectedWallet.publicKey) {
			console.log('No public key');
			return;
		}

		const signature = await connectedWallet.signMessage(data);
		console.log('Signature:', signature);

		server.createBlock(data, connectedWallet.publicKey, signature);

		data = '';
	}

	onDestroy(() => {
		server.disconnect();
	});
</script>

<div class="container mt-3">
	<div class="top-section sticky-top bg-white py-3">
		<div class="d-flex justify-content-between">
			<div class="align-self-start">
				<h1 class="text-center">Blockchain Super</h1>
			</div>
			<div class="align-self-end">
				<EthereumWallet />
				<SolanaWallet />
			</div>
		</div>
		<div class="row">
			<div class="col">
				<h5>
					Blockchain status: {#if blockChainStatus.valid}
						<span class="badge text-bg-success">Valid</span>
					{:else}
						<span class="badge text-bg-danger">Invalid</span>
						<hr />
						<ul class="list-group list-group-flush">
							{#each blockChainStatus.errors as error}
								<li class="list-group-item">{error}</li>
							{/each}
						</ul>
					{/if}
				</h5>
			</div>
		</div>

		<!-- Form to Add Blocks -->
		<div class="row mt-3">
			<div class="col">
				<div class="input-group">
					<input
						type="text"
						bind:value={data}
						class="form-control"
						placeholder="Enter data..."
						disabled={creationDisabled}
					/>
					<button class="btn btn-primary" on:click={createBlock} disabled={creationDisabled}
						>Create Block</button
					>
				</div>
			</div>
		</div>
	</div>
	<div class="blockchain-container">
		<div class="row mt-4">
			<h3 class="text-center">Blockchain</h3>
		</div>
		<!-- Blockchain Display -->
		<div class="row mt">
			{#each blockchain as block}
				<Block {block} />
			{/each}
		</div>
	</div>
</div>
<slot name="teleport"></slot>

<style>
	.blockchain-container {
		overflow-y: auto; /* Enable scrolling only in blockchain section */
		padding: 20px;
	}
	.sticky-top {
		position: -webkit-sticky;
		position: sticky;
		top: 0;
		z-index: 2;
	}
</style>
