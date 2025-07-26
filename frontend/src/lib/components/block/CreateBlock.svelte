<script lang="ts">
	import { onDestroy } from 'svelte';
	import { BlockchainServer } from '$lib/service/blockchain/blockchain-server';
	import type { WalletData } from '$lib/service/wallet';
	import { walletStore } from '$lib/store/walletStore';

	const server = BlockchainServer.getInstance();

	let connectedWallet: WalletData;
	let data = '';

	walletStore.subscribe((value) => {
		connectedWallet = value;
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

	onDestroy(() => {
		server.disconnect();
	});
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
	<div class="flex items-center space-x-2 mb-4">
		<i class="fa-solid fa-plus text-green-600"></i>
		<h2 class="text-lg font-semibold text-gray-900">Create Block</h2>
	</div>

	<form class="space-y-4">
		<div>
			<label for="blockData" class="block text-sm font-medium text-gray-700 mb-2">Block Data</label>
			<textarea
				id="blockData"
				bind:value={data}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-24 resize-none"
				placeholder="Enter data"
				disabled={creationDisabled}
			></textarea>
			<p class="text-xs text-gray-500 mt-1">Enter JSON data for the block</p>
		</div>

		<button
			on:click|preventDefault={createBlock}
			class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
			disabled={creationDisabled}
		>
			<i class="fa-solid fa-cube mr-2"></i>
			{creationDisabled ? 'Connect a wallet to create a block' : 'Create Block'}
		</button>
	</form>
</div>
