<script lang="ts">
	let block: any = null;
</script>

<div
	id="block-details-panel"
	class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-y-auto"
>
	<div class="mb-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-2">Block Details</h3>
		<p class="text-sm text-gray-500">Select a block to view its details</p>
	</div>

	<div id="block-details-content" class="space-y-6">
		{#if block}
			<div id="modal-content" class="p-6 space-y-6">
				<div class="grid grid-cols-2 gap-6">
					<div>
						<label class="text-sm font-medium text-gray-500">Block Index</label>
						<p class="text-lg font-semibold text-gray-900 mt-1">#1</p>
					</div>
					<div>
						<label class="text-sm font-medium text-gray-500">Network</label>
						<div class="flex items-center space-x-2 mt-1">
							<i class="fa-brands fa-ethereum text-blue-600"></i>
							<span class="text-gray-900">Ethereum</span>
						</div>
					</div>
				</div>

				<div>
					<label class="text-sm font-medium text-gray-500">Hash</label>
					<p class="font-mono text-sm text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 break-all">
						0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385
					</p>
				</div>

				<div>
					<label class="text-sm font-medium text-gray-500">Previous Hash</label>
					<p class="font-mono text-sm text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 break-all">
						0x6e8fade0c0d56a6af65ab3ead78fade0c0d56a6af65ab3ead6b1b1eb6a00a80274
					</p>
				</div>

				<div class="grid grid-cols-2 gap-6">
					<div>
						<label class="text-sm font-medium text-gray-500">Nonce</label>
						<p class="font-mono text-gray-900 mt-1">15847</p>
					</div>
					<div>
						<label class="text-sm font-medium text-gray-500">Timestamp</label>
						<p class="text-gray-900 mt-1">2024-01-15 14:32:18</p>
					</div>
				</div>

				<div>
					<label class="text-sm font-medium text-gray-500">Node ID</label>
					<p class="font-mono text-sm text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
						12D3KooWGzxzKZYveHMVto4S4ameCFuFZK4QRrMV5R7tQ
					</p>
				</div>

				<div>
					<label class="text-sm font-medium text-gray-500">Signer</label>
					<p class="font-mono text-sm text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
						0x742d35Cc6634C0532925a3b8D0B251732C4E8d35
					</p>
				</div>

				<div>
					<label class="text-sm font-medium text-gray-500">Signature</label>
					<p class="font-mono text-sm text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 break-all">
						0x1b4f47...8d9e2a
					</p>
				</div>

				<div>
					<label class="text-sm font-medium text-gray-500">Data</label>
					<div class="bg-gray-50 p-3 rounded-lg mt-1">
						<pre class="text-sm text-gray-900 whitespace-pre-wrap">
									abc
								</pre>
					</div>
				</div>
			</div>
		{:else}
			<div class="text-center py-12 text-gray-400">
				<i class="fa-solid fa-cube text-4xl mb-4"></i>
				<p class="text-sm">Click on a block to view details</p>
			</div>
		{/if}
	</div>
</div>
