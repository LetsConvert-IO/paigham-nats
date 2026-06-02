<script>
	import { toast } from '$lib/stores/toast.js';

	const alertClass = {
		success: 'alert-success',
		error: 'alert-error',
		warning: 'alert-warning',
		info: 'alert-info'
	};
</script>

<div class="toast toast-end toast-top z-50">
	{#each $toast as t (t.id)}
		<div class="alert {alertClass[t.type] || 'alert-info'} shadow-lg">
			<span>{t.message}</span>
			<button class="btn btn-ghost btn-xs" onclick={() => toast.remove(t.id)}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	{/each}
</div>
