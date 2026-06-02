import { writable } from 'svelte/store';

function createToastStore() {
	const { subscribe, update } = writable([]);

	let id = 0;

	function add(message, type = 'info', duration = 4000) {
		const toastId = ++id;
		update((toasts) => [...toasts, { id: toastId, message, type }]);

		if (duration > 0) {
			setTimeout(() => {
				remove(toastId);
			}, duration);
		}

		return toastId;
	}

	function remove(toastId) {
		update((toasts) => toasts.filter((t) => t.id !== toastId));
	}

	return {
		subscribe,
		success: (message, duration) => add(message, 'success', duration),
		error: (message, duration) => add(message, 'error', duration),
		warning: (message, duration) => add(message, 'warning', duration),
		info: (message, duration) => add(message, 'info', duration),
		remove
	};
}

export const toast = createToastStore();
