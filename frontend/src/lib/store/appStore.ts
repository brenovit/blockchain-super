import { writable } from 'svelte/store';

interface AppStore {
	clientId: string;
}

export const appStore = writable<AppStore>({
	clientId: ''
});
