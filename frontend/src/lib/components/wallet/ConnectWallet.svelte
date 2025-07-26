<script lang="ts">
	import { type WalletData } from '$lib/service/wallet';
	import { walletStore } from '$lib/store/walletStore';

	export let chain: string;
	export let connect;
	export let disconnect;

	let connectedWallet: WalletData;

	walletStore.subscribe((value) => {
		connectedWallet = value;
	});
</script>

{#if connectedWallet?.connected && connectedWallet.chain === chain}
	<div class="flex items-center space-x-4">
		<div class="flex items-center space-x-2">
			<img
				src={connectedWallet?.logo}
				alt={connectedWallet?.name}
				width="24"
				height="24"
				class="me-2"
			/>
			<span class="text-sm text-gray-700"
				>{connectedWallet.publicKey?.slice(0, 6)}...{connectedWallet.publicKey?.slice(-4)}</span
			>
		</div>
		<div class="md:flex items-center space-x-2 px-3 py-1">
			<button
				class="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 cursor-pointer"
				on:click={disconnect}
			>
				Disconnect
			</button>
		</div>
	</div>
{:else if !connectedWallet.connected}
	<button
		class="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 cursor-pointer"
		on:click={() => connect()}
	>
		<i class="fa-solid fa-wallet text-gray-600 text-sm"></i>
		<span class="text-sm text-gray-700">Connect {chain}</span>
	</button>
{/if}
