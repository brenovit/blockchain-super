<script lang="ts">
	import { blockchainStore } from '$lib/store/blockchainStore';

	let blockchain: any[] = [];
	let blockChainStatus: BlockchainStatus = { valid: true, errors: [] };

	blockchainStore.subscribe((value) => {
		blockchain = value.chain.sort((a, b) => b.index - a.index);
		blockChainStatus = value.status;
	});

	function showBlockDetails(index: number) {
		console.log(`Showing details for block #${index}`);
		// Logic to show block details
	}
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200">
	<div class="p-6 border-b border-gray-200">
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<i class="fa-solid fa-link text-blue-600"></i>
				<h2 class="text-lg font-semibold text-gray-900">Blockchain</h2>
			</div>
			<span class="text-sm text-gray-500">12 blocks</span>
		</div>
	</div>

	<div id="blocks-container" class="p-6 max-h-96 overflow-y-auto space-y-4">
		<!-- Block 1 -->
		<button
			class="block-card bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
			on:click={showBlockDetails(1)}
		>
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center space-x-2">
					<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
						>Block #1</span
					>
					<span class="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded"
						>Ethereum</span
					>
				</div>
				<span class="text-xs text-gray-500">2 min ago</span>
			</div>
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<span class="text-gray-500">Hash:</span>
					<p class="font-mono text-gray-900 truncate">
						0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385
					</p>
				</div>
				<div>
					<span class="text-gray-500">Nonce:</span>
					<p class="font-mono text-gray-900">15847</p>
				</div>
			</div>
		</button>

		<!-- Block 2 -->
		<button
			class="block-card bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
			on:click={openBlockModal(2)}
		>
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center space-x-2">
					<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
						>Block #2</span
					>
					<span class="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded"
						>Solana</span
					>
				</div>
				<span class="text-xs text-gray-500">5 min ago</span>
			</div>
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<span class="text-gray-500">Hash:</span>
					<p class="font-mono text-gray-900 truncate">
						0x8a1fade2c1d58a8af67ab5ead80fade2c1d58a8af67ab5ead8c3c3eb8b22a92486
					</p>
				</div>
				<div>
					<span class="text-gray-500">Nonce:</span>
					<p class="font-mono text-gray-900">23956</p>
				</div>
			</div>
		</button>

		<!-- Block 3 -->
		<button
			class="block-card bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
			on:click={openBlockModal(3)}
		>
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center space-x-2">
					<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
						>Block #3</span
					>
					<span class="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded"
						>Ethereum</span
					>
				</div>
				<span class="text-xs text-gray-500">8 min ago</span>
			</div>
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<span class="text-gray-500">Hash:</span>
					<p class="font-mono text-gray-900 truncate">
						0x9b2fade3c2d59b9af68ab6ead81fade3c2d59b9af68ab6ead9d4d4eb9c33a93587
					</p>
				</div>
				<div>
					<span class="text-gray-500">Nonce:</span>
					<p class="font-mono text-gray-900">31204</p>
				</div>
			</div>
		</button>

		<button
			class="block-card bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
			on:click={showBlockDetails(1)}
		>
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center space-x-2">
					<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
						>Block #1</span
					>
					<span class="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded"
						>Ethereum</span
					>
				</div>
				<span class="text-xs text-gray-500">2 min ago</span>
			</div>
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<span class="text-gray-500">Hash:</span>
					<p class="font-mono text-gray-900 truncate">
						0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385
					</p>
				</div>
				<div>
					<span class="text-gray-500">Nonce:</span>
					<p class="font-mono text-gray-900">15847</p>
				</div>
			</div>
		</button>

		<!-- Block 2 -->
		<button
			class="block-card bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
			on:click={openBlockModal(2)}
		>
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center space-x-2">
					<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
						>Block #2</span
					>
					<span class="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded"
						>Solana</span
					>
				</div>
				<span class="text-xs text-gray-500">5 min ago</span>
			</div>
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<span class="text-gray-500">Hash:</span>
					<p class="font-mono text-gray-900 truncate">
						0x8a1fade2c1d58a8af67ab5ead80fade2c1d58a8af67ab5ead8c3c3eb8b22a92486
					</p>
				</div>
				<div>
					<span class="text-gray-500">Nonce:</span>
					<p class="font-mono text-gray-900">23956</p>
				</div>
			</div>
		</button>

		<!-- Block 3 -->
		<button
			class="block-card bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
			on:click={openBlockModal(3)}
		>
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center space-x-2">
					<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
						>Block #3</span
					>
					<span class="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded"
						>Ethereum</span
					>
				</div>
				<span class="text-xs text-gray-500">8 min ago</span>
			</div>
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<span class="text-gray-500">Hash:</span>
					<p class="font-mono text-gray-900 truncate">
						0x9b2fade3c2d59b9af68ab6ead81fade3c2d59b9af68ab6ead9d4d4eb9c33a93587
					</p>
				</div>
				<div>
					<span class="text-gray-500">Nonce:</span>
					<p class="font-mono text-gray-900">31204</p>
				</div>
			</div>
		</button>
	</div>
</div>
