<script lang="ts">
	import { BlockchainServer } from '$lib/service/blockchain/blockchain-server';
	import type { Block } from '$lib/service/blockchain/model/blockchain';
	import { blockStore } from '$lib/store/blockchainStore';
	import Time from 'svelte-time';

	const server = BlockchainServer.getInstance();

	export let block: Block;

	$: valid_class = block.valid ? 'bg-success-subtle' : 'bg-danger-subtle';
	$: network_color = block.transaction.network == 'ethereum' ? 'bg-purple-100' : 'bg-orange-100';

	let loading = false;

	function mine() {
		server.mineBlock(block.index);
	}

	async function update() {
		server.updateBlock(block);
	}

	function showBlockDetails() {
		blockStore.set(block);
	}
</script>

<button
	type="button"
	class="block-card bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer text-left w-full"
	on:click={showBlockDetails}
	aria-label="Show block details"
>
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center space-x-2">
			<span class="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium"
				>#{block.index}</span
			>
			<span class="{network_color} text-xs font-medium px-2 py-1 rounded"
				>{block.transaction.network}</span
			>
			{#if block.valid}
				<div class="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
					<i class="fa-solid fa-check-circle text-green-500 text-xs"></i>
					<span class="text-xs text-green-700 font-medium">Valid</span>
				</div>
			{:else}
				<div class="flex items-center space-x-1 bg-red-50 px-2 py-1 rounded-full">
					<i class="fa-solid fa-exclamation-triangle text-red-500 text-xs"></i>
					<span class="text-xs text-red-700 font-medium">Invalid</span>
				</div>
			{/if}
		</div>
		<span class="text-xs text-gray-500"><Time relative timestamp={block.timestamp} /></span>
	</div>
	<div class="grid grid-cols-2 gap-4 text-sm mb-2">
		<div class="flex flex-col">
			<span class="text-gray-500">Data:</span>
			<p class="font-mono text-gray-900 truncate">{block.transaction.data}</p>
		</div>
		<div class="flex flex-col">
			<span class="text-gray-500">Nonce:</span>
			<p class="font-mono text-gray-900">{block.nonce}</p>
		</div>
		<div class="flex flex-col col-span-2">
			<span class="text-gray-500">Hash:</span>
			<p class="font-mono text-gray-900 truncate">{block.hash}</p>
		</div>
		<div class="flex flex-col col-span-2">
			<span class="text-gray-500">Previous Hash:</span>
			<p class="font-mono text-gray-900 truncate">{block.previousHash}</p>
		</div>
	</div>
</button>
