<script lang="ts">
	import Block from '$lib/components/block/Block.svelte';
	import { BlockchainServer } from '$lib/blockchain-server/blockchain-server';
	import type { BlockchainStatus } from '$lib/blockchain-server/model/blockchain';
	import { blockchainStore, appStore } from '$lib/store';
	import { onDestroy } from 'svelte';

	const server = BlockchainServer.getInstance();

	let blockchain: any[] = [];
	let blockChainStatus: BlockchainStatus = { valid: true, errors: [] };
	let data = '';
	let clientId = '';

	appStore.subscribe((value) => {
		clientId = value.clientId;
	});
	blockchainStore.subscribe((value) => {
		blockchain = value.chain;
		blockChainStatus = value.status;
	});

	function createBlock() {
		if (!data) return;

		server.createBlock(data);

		data = '';
	}

	onDestroy(() => {
		server.disconnect();
	});
</script>

<div class="container mt-3">
	<div class="top-section sticky-top bg-white py-3">
		<div class="row">
			<div class="col">
				<h1 class="text-center">Blockchain Simulator</h1>
				<h5>Client ID: <span class="badge text-bg-secondary">{clientId}</span></h5>
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

				<!-- Form to Add Blocks -->
				<div class="row mt-3">
					<div class="col">
						<div class="input-group">
							<input
								type="text"
								bind:value={data}
								class="form-control"
								placeholder="Enter data..."
							/>
							<button class="btn btn-primary" on:click={createBlock}>Create Block</button>
						</div>
					</div>
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

<style>
	.blockchain-container {
		overflow-y: auto; /* Enable scrolling only in blockchain section */
		padding: 20px;
	}
</style>
