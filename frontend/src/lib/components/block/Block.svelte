<script lang="ts">
	import { BlockchainServer } from '$lib/blockchain-server/blockchain-server';
	import type { Block } from '$lib/blockchain-server/model/blockchain';

	const server = BlockchainServer.getInstance();

	export let block: Block;

	$: valid_class = block.valid ? 'bg-success-subtle' : 'bg-danger-subtle';

	let loading = false;

	function mine() {
		server.mineBlock(block.index);
	}

	async function update() {
		server.updateBlock(block);
	}
</script>

<div class="mt-5">
	<div class="card p-4 {valid_class}">
		<form class="form-horizontal">
			<!-- Block Number -->
			<div class="mb-3 row">
				<label class="col-sm-2 col-form-label bold" for="blockNumber">Block:</label>
				<div class="col-sm-10">
					<div class="input-group">
						<span class="input-group-text">#</span>
						<input
							id="blockNumber"
							type="number"
							class="form-control"
							bind:value={block.index}
							disabled
						/>
					</div>
				</div>
			</div>

			<!-- Timestamp -->
			<div class="mb-3 row">
				<label class="col-sm-2 col-form-label" for="timestamp">Timestamp:</label>
				<div class="col-sm-10">
					<input
						id="timestamp"
						type="text"
						class="form-control"
						bind:value={block.timestamp}
						disabled
					/>
				</div>
			</div>

			<!-- Nonce -->
			<div class="mb-3 row">
				<label class="col-sm-2 col-form-label" for="nonce">Nonce:</label>
				<div class="col-sm-10">
					<input id="nonce" type="text" class="form-control" bind:value={block.nonce} />
				</div>
			</div>

			<!-- Data -->
			<div class="mb-3 row">
				<!-- Data ClientId -->
				<div class="mb-3 row">
					<label class="col-sm-2 col-form-label bold" for="data-clientId">ClientId:</label>
					<div class="col-sm-10">
						<div class="input-group">
							<span class="input-group-text">@</span>
							<input
								id="data-clientId"
								class="form-control"
								bind:value={block.data.clientId}
								disabled
							/>
						</div>
					</div>
				</div>
				<!-- Data Data -->
				<div class="mb-3 row">
					<label class="col-sm-2 col-form-label" for="data-data">Data:</label>
					<div class="col-sm-10">
						<textarea id="data-data" class="form-control" rows="5" bind:value={block.data.data}
						></textarea>
					</div>
				</div>
			</div>

			<!-- Previous Hash -->
			<div class="mb-3 row">
				<label class="col-sm-2 col-form-label" for="previousHash">Previous Hash:</label>
				<div class="col-sm-10">
					<input
						id="previousHash"
						type="text"
						class="form-control"
						bind:value={block.previousHash}
					/>
				</div>
			</div>

			<!-- Hash -->
			<div class="mb-3 row">
				<label class="col-sm-2 col-form-label" for="hash">Hash:</label>
				<div class="col-sm-10">
					<input id="hash" type="text" class="form-control" bind:value={block.hash} disabled />
				</div>
			</div>

			<!-- Mine Button -->
			<div class="row">
				<div class="col-sm-2">
					{#if loading}
						<div class="spinner-border text-primary" role="status"></div>
					{/if}
				</div>
				<div class="col-sm-1">
					<button class="btn btn-primary" on:click|preventDefault={mine} disabled={loading}>
						{loading ? 'Mining...' : 'Mine'}
					</button>
				</div>
				<div class="col-sm-1">
					<button class="btn btn-secondary" on:click|preventDefault={update} disabled={loading}>
						{loading ? 'Updating...' : 'Update'}
					</button>
				</div>
			</div>
		</form>
	</div>
</div>
