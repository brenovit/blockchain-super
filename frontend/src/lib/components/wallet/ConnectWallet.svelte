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
	<div class="d-flex align-items-center gap-2">
		<img
			src={connectedWallet?.logo}
			alt={connectedWallet?.name}
			width="24"
			height="24"
			class="me-2"
		/>
		<span class="badge bg-success text-wrap text-break">
			{connectedWallet.publicKey?.slice(0, 6)}...{connectedWallet.publicKey?.slice(-4)}
		</span>
		<button class="btn btn-sm btn-outline-danger" on:click={() => disconnect()}>Disconnect</button>
	</div>
{:else if !connectedWallet.connected}
	<button type="button" class="btn btn-outline-secondary" on:click={() => connect()}
		>Connect {chain}</button
	>
{/if}
