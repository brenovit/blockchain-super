import { writable } from 'svelte/store';

interface AppStore {
	nodeId: string;
	peerId: string;
	activeConnections: string;
}

export const appStore = writable<AppStore>({
	nodeId: '',
	peerId: '',
	activeConnections: ''
});
