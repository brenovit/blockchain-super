<script lang="ts">
	import { onMount } from 'svelte';
	import { createBlock, getBlockchain } from '$lib/blockchain/blockchain-service';
	import Block from '$lib/components/block/Block.svelte';
	import type { BlockchainStatus } from '$lib/blockchain/model/blockchain';
	let blockchain: any[] = [];
	let blockChainStatus: BlockchainStatus = { valid: true, errors: [] };
	let data = '';
	let loading = false;

	async function fetchBlockchain() {
		const res = await getBlockchain();
		blockchain = res.chain;
		blockChainStatus = res.status;
	}

	async function addBlock() {
		if (!data) return;
		loading = true;

		await createBlock(data);

		data = '';
		loading = false;
		fetchBlockchain();
	}

	onMount(fetchBlockchain);
</script>

<div class="container mt-5">
	<h1 class="text-center">Blockchain Simulator</h1>

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
				<button class="btn btn-primary" on:click={addBlock} disabled={loading}>
					{loading ? 'Mining...' : 'Add Block'}
				</button>
			</div>
		</div>
	</div>

	<!-- Blockchain Display -->
	<div class="row mt-3">
		{#each blockchain as block}
			<Block {block} onBlockUpdated={fetchBlockchain} />
		{/each}
	</div>
</div>
