<header id="header" class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                    <i class="fa-solid fa-cube text-blue-600 text-xl"></i>
                    <h1 class="text-xl font-bold text-gray-900">BlockChain Client</h1>
                </div>
                <div class="hidden md:flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span class="text-sm text-green-700 font-medium">Connected</span>
                </div>
            </div>

            <!-- Wallet Connection Panel -->
            <div id="wallet-panel" class="flex items-center space-x-3">
                <button class="hidden md:flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <i class="fa-solid fa-wallet text-sm"></i>
                    <span class="text-sm font-medium">Connect Wallet</span>
                </button>
                <div class="relative">
                    <button id="wallet-dropdown"
                            class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100">
                        <i class="fa-solid fa-chevron-down text-sm"></i>
                    </button>
                    <div id="wallet-menu"
                         class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                            <span class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                                <i class="fa-solid fa-ghost text-purple-600"></i>
                                <span>Phantom</span>
                            </span>
                        <span class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                                <i class="fa-brands fa-ethereum text-blue-600"></i>
                                <span>MetaMask</span>
                            </span>
                        <span class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                                <i class="fa-solid fa-sun text-orange-500"></i>
                                <span>Solflare</span>
                            </span>
                        <span class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                                <i class="fa-solid fa-coins text-blue-500"></i>
                                <span>Coinbase</span>
                            </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>
