<script lang="ts">
	import {
		connectToWallet,
		disconnectWallet
	} from '$lib/service/wallet/adapter/ethereumWalletAdapter';
	import ConnectWallet from './ConnectWallet.svelte';

	async function connect() {
		try {
			connectToWallet();
		} catch (err) {
			console.error('❌ Wallet connection failed:', err);
		}
	}

	function disconnect() {
		disconnectWallet();
	}
</script>

<ConnectWallet chain="ethereum" {connect} {disconnect} />
