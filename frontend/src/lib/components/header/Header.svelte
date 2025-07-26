<script lang="ts">
	import BlockList from '$lib/components/block/BlockList.svelte';
	import { BlockchainServer } from '$lib/service/blockchain/blockchain-server';
	import type { BlockchainStatus } from '$lib/service/blockchain/model/blockchain';
	import { walletStore } from '$lib/store/walletStore';
	import type { WalletData } from '$lib/service/wallet';
	import WalletConnection from './WalletConnection.svelte';

	let blockChainStatus: BlockchainStatus = { valid: true, errors: [] };
	let connectedWallet: WalletData;

	walletStore.subscribe((value) => {
		connectedWallet = value;
	});

	const server = BlockchainServer.getInstance();
</script>

<header id="header" class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<div class="flex items-center space-x-4">
				<div class="flex items-center space-x-2">
					<i class="fa-solid fa-cube text-blue-600 text-xl"></i>
					<h1 class="text-xl font-bold text-gray-900">BlockChain Super</h1>
				</div>
			</div>

			<!-- Wallet Connection Panel -->
			<WalletConnection />
		</div>
	</div>
</header>
