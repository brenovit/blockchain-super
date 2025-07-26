<script lang="ts">
	import type { BlockchainStatus } from '$lib/service/blockchain/model/blockchain';
	import { blockchainStore } from '$lib/store/blockchainStore';
	import BlockSummary from './BlockSummary.svelte';

	let blockchain: any[] = [];
	let blockChainStatus: BlockchainStatus = { valid: true, errors: [] };

	blockchainStore.subscribe((value) => {
		blockchain = value.chain.sort((a, b) => b.index - a.index);
		blockChainStatus = value.status;
	});
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200">
	<div class="p-6 border-b border-gray-200">
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<i class="fa-solid fa-link text-blue-600"></i>
				<h2 class="text-lg font-semibold text-gray-900">Blockchain</h2>
			</div>
			<span class="text-sm text-gray-500">{blockchain.length} blocks</span>
		</div>
	</div>

	<div id="blocks-container" class="p-6 max-h-screen overflow-y-auto space-y-4">
		{#each blockchain as block}
			<BlockSummary {block} />
		{/each}
	</div>
</div>
