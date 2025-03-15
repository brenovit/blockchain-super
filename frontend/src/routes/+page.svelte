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

	function addBlock() {
		if (!data) return;

		server.createBlock(data);

		data = '';
	}

	onDestroy(() => {
		server.disconnect();
	});
</script>

<div class="container mt-5">
	<h1 class="text-center">Blockchain Simulator</h1>
	<h3>Your Client ID: <span class="badge text-bg-secondary">{clientId}</span></h3>

	<div class="row mt-4">
		<div class="col-md">
			{#if blockChainStatus.valid}
				<div class="alert alert-success" role="alert">The chain is currently valid</div>
			{:else}
				<div class="alert alert-danger" role="alert">The chain is currently invalid</div>
				<hr />
				<ul class="list-group list-group-flush">
					{#each blockChainStatus.errors as error}
						<li class="list-group-item">{error}</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>

	<!-- Form to Add Blocks -->
	<div class="row mt-4">
		<div class="col-md-8 offset-md-2">
			<div class="input-group">
				<input type="text" bind:value={data} class="form-control" placeholder="Enter data..." />
				<button class="btn btn-primary" on:click={addBlock}>'Add Block'</button>
			</div>
		</div>
	</div>

	<!-- Blockchain Display -->
	<div class="row mt-3">
		{#each blockchain as block}
			<Block {block} />
		{/each}
	</div>
</div>
