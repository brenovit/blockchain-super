<script lang="ts">
	import SolanaWallet from '../wallet/SolanaWallet.svelte';
	import EthereumWallet from '../wallet/EthereumWallet.svelte';
</script>

<div id="wallet-panel" class="flex items-center space-x-4 relative min-w-max">
	<SolanaWallet />
	<EthereumWallet />
</div>
