<div id="wallet-panel" class="flex items-center space-x-4">
	<div class="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
		<i class="fa-solid fa-wallet text-gray-600 text-sm"></i>
		<span class="text-sm text-gray-700">Connect Wallet</span>
		<button class="text-gray-500 hover:text-gray-700">
			<i class="fa-solid fa-chevron-down text-xs"></i>
		</button>
	</div>

	<!-- Wallet Dropdown -->
	<div
		id="wallet-dropdown"
		class="hidden absolute top-16 right-6 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-48"
	>
		<button
			class="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
		>
			<div class="w-6 h-6 bg-purple-600 rounded"></div>
			<span class="text-sm font-medium">Solana</span>
		</button>
		<button
			class="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
		>
			<div class="w-6 h-6 bg-orange-500 rounded"></div>
			<span class="text-sm font-medium">Ethereum</span>
		</button>
	</div>
</div>
