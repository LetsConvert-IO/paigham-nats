<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getConsumer, deleteConsumer } from '$lib/api.js';
	import { toast } from '$lib/stores/toast.js';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import JsonViewer from '$lib/components/JsonViewer.svelte';

	let consumer = $state(null);
	let loading = $state(true);
	let error = $state(null);

	let deleteModalOpen = $state(false);
	let showConfig = $state(false);

	let streamName = $derived($page.params.stream);
	let consumerName = $derived($page.params.name);

	onMount(loadConsumer);

	async function loadConsumer() {
		loading = true;
		error = null;
		try {
			consumer = await getConsumer(streamName, consumerName);
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	async function handleDelete() {
		try {
			await deleteConsumer(streamName, consumerName);
			toast.success(`Consumer "${consumerName}" deleted`);
			goto(`/streams/${streamName}`);
		} catch (e) {
			toast.error(`Failed to delete consumer: ${e.message}`);
		}
	}
</script>

<ConfirmModal
	bind:open={deleteModalOpen}
	title="Delete Consumer"
	message="Are you sure you want to delete consumer '{consumerName}'? This action cannot be undone."
	confirmText="Delete"
	onConfirm={handleDelete}
/>

<div class="space-y-4 sm:space-y-6">
	<!-- Breadcrumb -->
	<div class="text-sm breadcrumbs overflow-x-auto">
		<ul>
			<li><a href="/streams">Streams</a></li>
			<li><a href="/streams/{streamName}" class="max-w-[100px] truncate">{streamName}</a></li>
			<li class="max-w-[150px] truncate">{consumerName}</li>
		</ul>
	</div>

	{#if loading}
		<div class="flex justify-center p-8">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if error}
		<div class="alert alert-error">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>{error}</span>
			<a href="/streams/{streamName}" class="btn btn-sm">Back to Stream</a>
		</div>
	{:else if consumer}
		<!-- Header -->
		<div class="flex flex-col gap-4">
			<div>
				<h1 class="text-xl sm:text-2xl font-bold break-all">{consumer.name}</h1>
				<p class="text-base-content/60 mt-1">Consumer on <a href="/streams/{streamName}" class="link">{streamName}</a></p>
			</div>
			<div class="flex flex-wrap gap-2">
				<button class="btn btn-ghost btn-sm" onclick={loadConsumer}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
					Refresh
				</button>
				<button class="btn btn-error btn-sm" onclick={() => deleteModalOpen = true}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
					Delete
				</button>
			</div>
		</div>

		<!-- Stats -->
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
			<div class="stat bg-base-100 rounded-lg shadow p-3 sm:p-4">
				<div class="stat-title text-xs sm:text-sm">Pending</div>
				<div class="stat-value text-base sm:text-lg">{consumer.num_pending.toLocaleString()}</div>
			</div>
			<div class="stat bg-base-100 rounded-lg shadow p-3 sm:p-4">
				<div class="stat-title text-xs sm:text-sm">Ack Pending</div>
				<div class="stat-value text-base sm:text-lg">{consumer.num_ack_pending}</div>
			</div>
			<div class="stat bg-base-100 rounded-lg shadow p-3 sm:p-4">
				<div class="stat-title text-xs sm:text-sm">Redelivered</div>
				<div class="stat-value text-base sm:text-lg">{consumer.num_redelivered}</div>
			</div>
			<div class="stat bg-base-100 rounded-lg shadow p-3 sm:p-4">
				<div class="stat-title text-xs sm:text-sm">Waiting</div>
				<div class="stat-value text-base sm:text-lg">{consumer.num_waiting}</div>
			</div>
		</div>

		<!-- Delivery Info -->
		<div class="card bg-base-100 shadow">
			<div class="card-body p-4 sm:p-6">
				<h2 class="card-title text-base sm:text-lg">Delivery Status</h2>
				<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
					<div>
						<p class="text-xs sm:text-sm text-base-content/60">Delivered Stream Seq</p>
						<p class="font-medium font-mono text-sm sm:text-base">{consumer.delivered?.stream_seq || 0}</p>
					</div>
					<div>
						<p class="text-xs sm:text-sm text-base-content/60">Delivered Consumer Seq</p>
						<p class="font-medium font-mono text-sm sm:text-base">{consumer.delivered?.consumer_seq || 0}</p>
					</div>
					<div>
						<p class="text-xs sm:text-sm text-base-content/60">Ack Floor Stream Seq</p>
						<p class="font-medium font-mono text-sm sm:text-base">{consumer.ack_floor?.stream_seq || 0}</p>
					</div>
					<div>
						<p class="text-xs sm:text-sm text-base-content/60">Ack Floor Consumer Seq</p>
						<p class="font-medium font-mono text-sm sm:text-base">{consumer.ack_floor?.consumer_seq || 0}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Config -->
		<div class="card bg-base-100 shadow">
			<div class="card-body p-4 sm:p-6">
				<div class="flex items-center justify-between">
					<h2 class="card-title text-base sm:text-lg">Configuration</h2>
					<button class="btn btn-ghost btn-sm" onclick={() => showConfig = !showConfig}>
						{showConfig ? 'Hide' : 'Show'} JSON
					</button>
				</div>
				{#if showConfig}
					<JsonViewer data={JSON.stringify(consumer.config, null, 2)} />
				{:else}
					<div class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
						<div>
							<p class="text-xs sm:text-sm text-base-content/60">Durable Name</p>
							<p class="font-medium text-sm sm:text-base break-all">{consumer.config.durable_name || '-'}</p>
						</div>
						<div>
							<p class="text-xs sm:text-sm text-base-content/60">Deliver Policy</p>
							<p class="font-medium text-sm sm:text-base">{consumer.config.deliver_policy || 'All'}</p>
						</div>
						<div>
							<p class="text-xs sm:text-sm text-base-content/60">Ack Policy</p>
							<p class="font-medium text-sm sm:text-base">{consumer.config.ack_policy || 'Explicit'}</p>
						</div>
						<div>
							<p class="text-xs sm:text-sm text-base-content/60">Ack Wait</p>
							<p class="font-medium text-sm sm:text-base">{consumer.config.ack_wait || '-'}</p>
						</div>
						<div>
							<p class="text-xs sm:text-sm text-base-content/60">Max Deliver</p>
							<p class="font-medium text-sm sm:text-base">{consumer.config.max_deliver === -1 ? 'Unlimited' : consumer.config.max_deliver}</p>
						</div>
						<div>
							<p class="text-xs sm:text-sm text-base-content/60">Max Ack Pending</p>
							<p class="font-medium text-sm sm:text-base">{consumer.config.max_ack_pending === -1 ? 'Unlimited' : consumer.config.max_ack_pending}</p>
						</div>
						{#if consumer.config.filter_subject}
							<div class="col-span-2 lg:col-span-3">
								<p class="text-xs sm:text-sm text-base-content/60">Filter Subject</p>
								<p class="font-medium text-sm sm:text-base break-all">{consumer.config.filter_subject}</p>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
