import { writable } from 'svelte/store';

export const userStore = writable<{} | null>(null);
