import { blockchainStore } from '$lib/store/blockchainStore';
import { signMessage } from '../wallet';
import type { BlockchainReceiveEvent, BlockchainSendEvent } from './model/blockchain';

export class BlockchainServer {
	private static instance: BlockchainServer;
	private socket: WebSocket | undefined;
	//private clientId: string | null = null;
	private receivedEventIds = new Set<string>(); // ✅ Track processed messages

	private constructor() {
		this.connect();
	}

	connect() {
		if (typeof window !== 'undefined') {
			this.socket = new WebSocket('ws://localhost:5000');
			this.socket.onopen = () => console.log('✅ WebSocket opened');
			this.socket.onclose = () => console.log('❌ WebSocket closed');
			this.socket.onmessage = (message) => {
				const event = JSON.parse(message.data) as BlockchainReceiveEvent;
				if (this.receivedEventIds.has(event.id)) {
					return;
				}
				console.log(`📩 Received event: ${event.type} | ${event.id}`);
				this.receivedEventIds.add(event.id);
				switch (event.type) {
					case 'BLOCKCHAIN':
						blockchainStore.set(event.data);
						break;
					case 'CLIENT_ID':
						/*appStore.set({
							clientId: event.data
						});
						this.clientId = event.data;*/
						break;
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

	async createBlock(data: any, signer: string) {
		if (!data) return;
		if (this.socket?.readyState === WebSocket.OPEN) {
			const signature = await signMessage(JSON.stringify(data));
			this.send({
				type: 'CREATE_BLOCK',
				data: {
					data,
					signer,
					signature: signature.values().toArray()
				}
			});
		}
	}

	mineBlock(index: number) {
		if (this.socket?.readyState === WebSocket.OPEN) {
			this.send({ type: 'MINE_BLOCK', data: index });
		}
	}

	updateBlock(data: any) {
		if (!data) return;
		if (this.socket?.readyState === WebSocket.OPEN) {
			this.send({ type: 'UPDATE_BLOCK', data });
		}
	}

	private send(message: BlockchainSendEvent) {
		this.socket?.send(JSON.stringify(message));
	}

	disconnect() {
		this.socket?.close();
	}
}
