<script lang="ts">
	import type { Block } from '$lib/service/blockchain/model/blockchain';
	import { blockStore } from '$lib/store/blockchainStore';

	let block: Block | null = null;

	blockStore.subscribe((value) => {
		block = value;
	});
</script>

<div
	id="block-details-panel"
	class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-y-auto"
>
	<div class="mb-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-2">Block Details</h3>
	</div>

	<div id="block-details-content">
		{#if block}
			<div id="modal-content" class="space-y-4">
				<div class="grid grid-cols-2 gap-6">
					<div>
						<p class="text-sm font-medium text-gray-500">Block Index</p>
						<p class="text-gray-900 mt-1">#{block.index}</p>
					</div>
					<div>
						<p class="text-sm font-medium text-gray-500">Network</p>
						<span class="text-gray-900 mt-1">{block.transaction.network}</span>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-6">
					<div>
						<p class="text-sm font-medium text-gray-500">Node ID</p>
						<p class="font-mono text-gray-900 mt-1">{block.transaction.nodeId}</p>
					</div>
					<div>
						<p class="text-sm font-medium text-gray-500">Nonce</p>
						<p class="font-mono text-gray-900 mt-1">{block.nonce}</p>
					</div>
				</div>

				<div>
					<div>
						<p class="text-sm font-medium text-gray-500">Timestamp</p>
						<p class="font-mono text-sm text-gray-900 mt-1">{block.timestamp}</p>
					</div>
				</div>

				<div>
					<p class="text-sm font-medium text-gray-500">Data</p>
					<p class="font-mono text-sm text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 break-all">
						{block.transaction.data}
					</p>
				</div>

				<div>
					<p class="text-sm font-medium text-gray-500">Signer</p>
					<p class="font-mono text-sm text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 break-all">
						{block.transaction.signer}
					</p>
				</div>

				<div>
					<p class="text-sm font-medium text-gray-500">Signature</p>
					<p class="font-mono text-sm text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 break-all">
						{block.transaction.signature}
					</p>
				</div>

				<div>
					<p class="text-sm font-medium text-gray-500">Hash</p>
					<p class="font-mono text-sm text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 break-all">
						{block.hash}
					</p>
				</div>

				<div>
					<p class="text-sm font-medium text-gray-500">Previous Hash</p>
					<p class="font-mono text-sm text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 break-all">
						{block.previousHash}
					</p>
				</div>
			</div>
		{:else}
			<div class="text-center py-12 text-gray-400">
				<i class="fa-solid fa-cube text-4xl mb-4"></i>
				<p class="text-sm">Click on a block to view details</p>
			</div>
		{/if}
	</div>
</div>
