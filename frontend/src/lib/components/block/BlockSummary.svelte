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
	class="block-card bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all"
	data-block-id="1247"
	on:click={showBlockDetails}
>
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center space-x-3">
			<span class="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">#1247</span>
			<span class="text-xs text-gray-500">2 min ago</span>
		</div>
		<span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Solana</span>
	</div>
	<div class="grid grid-cols-2 gap-4 text-sm">
		<div>
			<span class="text-gray-500">Hash:</span>
			<p class="font-mono text-xs mt-1">0xa1b2c3d4...ef567890</p>
		</div>
		<div>
			<span class="text-gray-500">Nonce:</span>
			<p class="font-mono text-xs mt-1">42851</p>
		</div>
		<div>
			<span class="text-gray-500">Signer:</span>
			<p class="font-mono text-xs mt-1">0x742d35...8f2a1b3c</p>
		</div>
		<div>
			<span class="text-gray-500">Data Size:</span>
			<p class="text-xs mt-1">2.4 KB</p>
		</div>
	</div>
</button>

<button
	class="block-card bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
	on:click={showBlockDetails}
>
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center space-x-2">
			<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
				>Block #{block.index}</span
			>
			<span class="{network_color} text-xs font-medium px-2 py-1 rounded"
				>{block.transaction.network}</span
			>
		</div>
		<span class="text-xs text-gray-500"><Time relative timestamp={block.timestamp} /></span>
	</div>
	<div class="grid grid-cols-2 gap-4 text-sm mb-2">
		<div class="flex flex-col">
			<span class="text-gray-500">Hash:</span>
			<p class="font-mono text-gray-900 truncate">{block.hash}</p>
		</div>
		<div class="flex flex-col">
			<span class="text-gray-500">Nonce:</span>
			<p class="font-mono text-gray-900">{block.nonce}</p>
		</div>
	</div>
	<div class="grid grid-cols-2 gap-4 text-sm">
		<div class="flex flex-col col-span-2">
			<span class="text-gray-500">Data:</span>
			<p class="font-mono text-gray-900 truncate">{block.transaction.data}</p>
		</div>
	</div>
</button>
