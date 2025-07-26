<script lang="ts">
	import { onMount } from 'svelte';

	import {
		connectToWallet,
		disconnectWallet,
		listWallets
	} from '$lib/service/wallet/adapter/solanaWalletAdapter';
	import ConnectWallet from './ConnectWallet.svelte';
	import type { WalletData } from '$lib/service/wallet';

	let dialogRef: HTMLDialogElement | null = null;

	let wallets: WalletData[] = [];

	onMount(() => {
		wallets = listWallets();
	});

	function connect() {
		dialogRef?.showPopover();
	}

	function disconnect() {
		disconnectWallet();
	}

	async function openWallet(wallet: any) {
		try {
			await connectToWallet(wallet.name);
			dialogRef?.hidePopover();
		} catch (err) {
			console.error('❌ Wallet oppening failed:', err);
		}
	}
</script>

<ConnectWallet chain="solana" {connect} {disconnect} />

<!--class="flex items-center justify-center min-h-screen rounded-xl min-w-[320px] bg-white shadow-2xl border-0 p-0"
class="rounded-xl min-w-[320px] bg-white shadow-2xl border-0 p-0 flex items-center justify-center fixed inset-0 m-auto"-->

<dialog
	popover
	bind:this={dialogRef}
	class="rounded-xl min-w-[320px] bg-white shadow-2xl border-0 p-0"
>
	<div class="p-6">
		<h5 class="text-lg font-semibold mb-4">Select a Wallet</h5>
		<div>
			{#each wallets as wallet}
				<button
					class="flex items-center justify-start w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition gap-2"
					on:click={() => openWallet(wallet)}
				>
					<img src={wallet.logo} alt={wallet.name} width="24" height="24" class="mr-2" />
					<span class="text-base">{wallet.name}</span>
				</button>
			{/each}
		</div>
		<div class="mt-6 flex justify-end">
			<button
				class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
				on:click={() => dialogRef?.hidePopover()}
			>
				Cancel
			</button>
		</div>
	</div>
</dialog>
