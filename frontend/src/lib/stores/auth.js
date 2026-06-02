import { writable } from 'svelte/store';
import { getMe, logout as apiLogout } from '$lib/api.js';

function createAuthStore() {
	const { subscribe, set, update } = writable({
		loading: true,
		authenticated: false,
		authEnabled: false,
		user: null
	});

	return {
		subscribe,
		async init() {
			try {
				const data = await getMe();
				set({
					loading: false,
					authenticated: data.authenticated,
					authEnabled: data.auth_enabled,
					user: data.user || null
				});
			} catch (error) {
				set({
					loading: false,
					authenticated: false,
					authEnabled: true,
					user: null
				});
			}
		},
		async logout() {
			try {
				await apiLogout();
				set({
					loading: false,
					authenticated: false,
					authEnabled: true,
					user: null
				});
			} catch (error) {
				console.error('Logout failed:', error);
			}
		}
	};
}

export const auth = createAuthStore();
