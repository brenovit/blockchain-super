<script lang="ts">
	import { onMount } from 'svelte';

	let blockchain: any[] = [];
	let blockChainValid = true;
	let data = '';
	let loading = false;

	async function fetchBlockchain() {
		const res = await fetch('http://localhost:3001/blockchain');
		const chain = await res.json();
		blockchain = chain.blocks;
		blockChainValid = chain.valid;
	}

	async function addBlock() {
		if (!data) return;
		loading = true;

		await fetch('http://localhost:3001/add-block', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ data })
		});

		data = '';
		loading = false;
		fetchBlockchain(); // Refresh blockchain
	}

	onMount(fetchBlockchain);
</script>

<div class="container mt-5">
	<h1 class="text-center">Blockchain Simulator</h1>

	<div class="row mt-4">
		<div class="col-md-6 offset-md-3">
			{#if blockChainValid}
				<div class="alert alert-success" role="alert">The chain is currently valid</div>
			{:else}
				<div class="alert alert-danger" role="alert">The chain is currently invalid</div>
			{/if}
		</div>
	</div>

	<!-- Form to Add Blocks -->
	<div class="row mt-4">
		<div class="col-md-6 offset-md-3">
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
			<div class="col-md-6 offset-md-3 mb-3">
				<div class="card">
					<div class="card-body">
						<h5 class="card-title">Block {block.index}</h5>
						<p><strong>Nonce:</strong> {block.nonce}</p>
						<p><strong>Timestamp:</strong> {block.timestamp}</p>
						<p><strong>Data:</strong> {JSON.stringify(block.data)}</p>
						<p><strong>Previous Hash:</strong> <small>{block.previousHash}</small></p>
						<p><strong>Hash:</strong> <small>{block.hash}</small></p>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
