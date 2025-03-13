import { blockchainStore, appStore } from '$lib/store';
import { ServerMessageType } from './model/server-message-type';

export class BlockchainServer {
	private static instance: BlockchainServer;
	private socket: WebSocket | undefined;
	private clientId: string | null = null;

	private constructor() {
		this.connect();
	}

	connect() {
		if (typeof window !== 'undefined') {
			this.socket = new WebSocket('ws://localhost:5000');
			this.socket.onopen = () => console.log('✅ WebSocket opened');
			this.socket.onclose = () => console.log('❌ WebSocket closed');
			this.socket.onmessage = (message) => {
				const event = JSON.parse(message.data);
				if (event.type === ServerMessageType.blockchain) {
					blockchainStore.set(event.data);
				}
				if (event.type === ServerMessageType.clientId) {
					appStore.set({
						clientId: event.data
					});
					this.clientId = event.data;
				}
			};

			window.addEventListener('beforeunload', () => {
				BlockchainServer.getInstance().disconnect();
			});

			console.log('✅ WebSocket connected');
		}
	}

	static getInstance(): BlockchainServer {
		if (!BlockchainServer.instance) {
			BlockchainServer.instance = new BlockchainServer();
		}
		return BlockchainServer.instance;
	}

	createBlock(data: any) {
		if (!data) return;
		if (this.socket?.readyState === WebSocket.OPEN) {
			this.socket?.send(
				JSON.stringify({ type: ServerMessageType.createBlock, data, clientId: this.clientId })
			);
		}
	}

	mineBlock(index: number) {
		if (this.socket?.readyState === WebSocket.OPEN) {
			this.socket?.send(
				JSON.stringify({ type: ServerMessageType.mineBlock, data: index, clientId: this.clientId })
			);
		}
	}

	updateBlock(data: any) {
		if (!data) return;
		if (this.socket?.readyState === WebSocket.OPEN) {
			this.socket?.send(
				JSON.stringify({ type: ServerMessageType.updateBlock, data, clientId: this.clientId })
			);
		}
	}

	disconnect() {
		this.socket?.close();
	}
}
