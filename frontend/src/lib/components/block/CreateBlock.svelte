<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
	<div class="flex items-center space-x-2 mb-4">
		<i class="fa-solid fa-plus text-green-600"></i>
		<h2 class="text-lg font-semibold text-gray-900">Create Block</h2>
	</div>

	<form class="space-y-4">
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Block Data</label>
			<textarea
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-24 resize-none"
				placeholder="Data"
			></textarea>
			<p class="text-xs text-gray-500 mt-1">Enter JSON data for the block</p>
		</div>

		<button
			type="submit"
			class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
		>
			<i class="fa-solid fa-cube mr-2"></i>
			Create Block
		</button>
	</form>
</div>
