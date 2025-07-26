<script lang="ts">
	import Block from '$lib/components/block/Block.svelte';
	import { BlockchainServer } from '$lib/service/blockchain/blockchain-server';
	import type { BlockchainStatus } from '$lib/service/blockchain/model/blockchain';
	import { blockchainStore } from '$lib/store/blockchainStore';
	import { walletStore } from '$lib/store/walletStore';
	import { onDestroy } from 'svelte';
	import type { WalletData } from '$lib/service/wallet';
	import EthereumWallet from '$lib/components/wallet/EthereumWallet.svelte';
	import SolanaWallet from '$lib/components/wallet/SolanaWallet.svelte';
	import Header from '$lib/components/header/Header.svelte';

	const server = BlockchainServer.getInstance();

	let blockchain: any[] = [];
	let blockChainStatus: BlockchainStatus = { valid: true, errors: [] };
	let data = '';
	let connectedWallet: WalletData;

	walletStore.subscribe((value) => {
		connectedWallet = value;
	});
	blockchainStore.subscribe((value) => {
		blockchain = value.chain.sort((a, b) => b.index - a.index);
		blockChainStatus = value.status;
	});

	$: creationDisabled = !(connectedWallet && connectedWallet.connected);

	async function createBlock() {
		if (!data) return;

		if (!connectedWallet.publicKey) {
			console.log('No public key');
			return;
		}

		const signature = await connectedWallet.signMessage(data);
		console.log('Signature:', signature);

		server.createBlock(data, connectedWallet.publicKey, signature);

		data = '';
	}

	function openBlockModal(blockIndex: number) {
		// Logic to open a modal with block details
		console.log(`Opening modal for Block #${blockIndex}`);
	}

	onDestroy(() => {
		server.disconnect();
	});
</script>

<Header />
<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
		<!-- Node Summary Panel -->
		<div id="node-summary" class="lg:col-span-1 space-y-6">
			<!-- Node Status Card -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
				<div class="flex items-center space-x-2 mb-4">
					<i class="fa-solid fa-server text-blue-600"></i>
					<h2 class="text-lg font-semibold text-gray-900">Node Status</h2>
				</div>

				<div class="space-y-4">
					<div>
						<label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Peer ID</label>
						<p class="text-sm font-mono text-gray-900 mt-1">12D3KooWGzxzKZYv...R7tQ</p>
					</div>

					<div>
						<label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
						<div class="flex items-center space-x-2 mt-1">
							<div class="w-2 h-2 bg-green-500 rounded-full"></div>
							<span class="text-sm text-green-700 font-medium">Active</span>
						</div>
					</div>

					<div>
						<label class="text-xs font-medium text-gray-500 uppercase tracking-wide"
							>Active Connections</label
						>
						<p class="text-2xl font-bold text-gray-900 mt-1">8</p>
					</div>

					<div>
						<label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Network</label>
						<div class="flex items-center space-x-2 mt-1">
							<i class="fa-brands fa-ethereum text-blue-600 text-sm"></i>
							<span class="text-sm text-gray-700">Ethereum</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Create Block Card -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
				<div class="flex items-center space-x-2 mb-4">
					<i class="fa-solid fa-plus text-green-600"></i>
					<h2 class="text-lg font-semibold text-gray-900">Create Block</h2>
				</div>

				<form class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Network</label>
						<select
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
						>
							<option>Ethereum</option>
							<option>Solana</option>
						</select>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Block Data</label>
						<textarea
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-24 resize-none"
							placeholder="Data"
						></textarea>
						<p class="text-xs text-gray-500 mt-1">Enter JSON data for the block</p>
					</div>

					<button
						type="submit"
						class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
					>
						<i class="fa-solid fa-cube mr-2"></i>
						Create Block
					</button>
				</form>
			</div>
		</div>

		<!-- Blockchain Display -->
		<div id="blockchain-display" class="lg:col-span-3">
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
						on:click={openBlockModal(1)}
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
		</div>
	</div>
</main>
<!--
<div class="container mt-3">
	<div class="top-section sticky-top bg-white py-3">
		<div class="d-flex justify-content-between">
			<div class="align-self-start">
				<h1 class="text-center">Blockchain Super</h1>
			</div>
			<div class="align-self-end">
				<EthereumWallet />
				<SolanaWallet />
			</div>
		</div>
		<div class="row">
			<div class="col">
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
			</div>
		</div>

		<div class="row mt-3">
			<div class="col">
				<div class="input-group">
					<input
						type="text"
						bind:value={data}
						class="form-control"
						placeholder="Enter data..."
						disabled={creationDisabled}
					/>
					<button class="btn btn-primary" on:click={createBlock} disabled={creationDisabled}
						>Create Block</button
					>
				</div>
			</div>
		</div>
	</div>
	<div class="blockchain-container">
		<div class="row mt-4">
			<h3 class="text-center">Blockchain</h3>
		</div>
		<div class="row mt">
			{#each blockchain as block}
				<Block {block} />
			{/each}
		</div>
	</div>
</div>
<slot name="teleport"></slot>

<style>
	.blockchain-container {
		overflow-y: auto; /* Enable scrolling only in blockchain section */
		padding: 20px;
	}
	.sticky-top {
		position: -webkit-sticky;
		position: sticky;
		top: 0;
		z-index: 2;
	}
</style>
-->
