<script lang="ts">
	import Header from '$lib/components/header/Header.svelte';
	import CreateBlock from '$lib/components/block/CreateBlock.svelte';
	import NodeStatus from '$lib/components/node/NodeStatus.svelte';
	import BlockList from '$lib/components/block/BlockList.svelte';
	import BlockDetail from '$lib/components/block/BlockDetail.svelte';
</script>

<Header />

<main class="max-w-7xl mx-auto">
	<div class="px-1 py-6">
		<div class="grid grid-cols-7 gap-4">
			<div id="management" class="col-span-2 space-y-6">
				<NodeStatus />
				<CreateBlock />
			</div>

			<!-- Blockchain Display -->
			<div id="blockchain-display" class="col-span-3">
				<BlockList />
			</div>
			<div id="blockchain-info" class="col-span-2">
				<BlockDetail />
			</div>
		</div>
	</div>
</main>
