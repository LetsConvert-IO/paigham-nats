<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getStream, getConsumers, deleteStream, purgeStream, deleteConsumer } from '$lib/api.js';
	import { toast } from '$lib/stores/toast.js';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import JsonViewer from '$lib/components/JsonViewer.svelte';

	let stream = $state(null);
	let consumers = $state([]);
	let loading = $state(true);
	let error = $state(null);

	// Consumer search
	let consumerSearch = $state('');

	let deleteStreamModalOpen = $state(false);
	let purgeStreamModalOpen = $state(false);
	let deleteConsumerModalOpen = $state(false);
	let selectedConsumer = $state(null);
	let showConfig = $state(false);

	let streamName = $derived($page.params.name);

	onMount(loadData);

	async function loadData() {
		loading = true;
		error = null;
		try {
			const [streamData, consumersData] = await Promise.all([
				getStream(streamName),
				getConsumers(streamName)
			]);
			stream = streamData;
			consumers = consumersData;
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	// Filtered consumers
	let filteredConsumers = $derived(() => {
		if (!consumerSearch.trim()) return consumers;
		const query = consumerSearch.toLowerCase();
		return consumers.filter(c =>
			c.name.toLowerCase().includes(query) ||
			c.config?.filter_subject?.toLowerCase().includes(query)
		);
	});

	async function handleDeleteStream() {
		try {
			await deleteStream(streamName);
			toast.success(`Stream "${streamName}" deleted`);
			goto('/streams');
		} catch (e) {
			toast.error(`Failed to delete stream: ${e.message}`);
		}
	}

	async function handlePurgeStream() {
		try {
			await purgeStream(streamName);
			toast.success(`Stream "${streamName}" purged`);
			await loadData();
		} catch (e) {
			toast.error(`Failed to purge stream: ${e.message}`);
		}
	}

	function confirmDeleteConsumer(consumer) {
		selectedConsumer = consumer;
		deleteConsumerModalOpen = true;
	}

	async function handleDeleteConsumer() {
		if (!selectedConsumer) return;
		try {
			await deleteConsumer(streamName, selectedConsumer.name);
			toast.success(`Consumer "${selectedConsumer.name}" deleted`);
			await loadData();
		} catch (e) {
			toast.error(`Failed to delete consumer: ${e.message}`);
		}
	}

	function formatBytes(bytes) {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
</script>

<ConfirmModal
	bind:open={deleteStreamModalOpen}
	title="Delete Stream"
	message="Are you sure you want to delete stream '{streamName}'? This will also delete all consumers and messages. This action cannot be undone."
	confirmText="Delete"
	onConfirm={handleDeleteStream}
/>

<ConfirmModal
	bind:open={purgeStreamModalOpen}
	title="Purge Stream"
	message="Are you sure you want to purge all messages from stream '{streamName}'?"
	confirmText="Purge"
	confirmClass="btn-warning"
	onConfirm={handlePurgeStream}
/>

<ConfirmModal
	bind:open={deleteConsumerModalOpen}
	title="Delete Consumer"
	message="Are you sure you want to delete consumer '{selectedConsumer?.name}'?"
	confirmText="Delete"
	onConfirm={handleDeleteConsumer}
/>

<div class="space-y-4">
	<!-- Breadcrumb -->
	<div class="text-sm breadcrumbs">
		<ul>
			<li><a href="/streams" class="text-primary">Streams</a></li>
			<li class="font-medium max-w-[200px] truncate">{streamName}</li>
		</ul>
	</div>

	{#if loading}
		<div class="flex flex-col items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg text-primary"></span>
			<p class="text-base-content/60 mt-4">Loading stream details...</p>
		</div>
	{:else if error}
		<div class="alert alert-error shadow-lg">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<div>
				<h3 class="font-bold">Error</h3>
				<div class="text-sm">{error}</div>
			</div>
			<a href="/streams" class="btn btn-sm btn-ghost">Back to Streams</a>
		</div>
	{:else if stream}
		<!-- Header -->
		<div class="flex flex-col gap-4">
			<div>
				<h1 class="text-2xl font-bold break-all">{stream.name}</h1>
				{#if stream.description}
					<p class="text-base-content/60 mt-1">{stream.description}</p>
				{/if}
			</div>
			<div class="flex flex-wrap gap-2">
				<a href="/streams/{streamName}/messages" class="btn btn-primary btn-sm">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
					Messages
				</a>
				<button class="btn btn-warning btn-sm" onclick={() => purgeStreamModalOpen = true}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
					Purge
				</button>
				<button class="btn btn-error btn-sm" onclick={() => deleteStreamModalOpen = true}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
					Delete
				</button>
			</div>
		</div>

		<!-- Stats -->
		<div class="grid grid-cols-2 gap-3">
			<div class="card bg-gradient-to-br from-primary to-primary/80 text-primary-content shadow-lg">
				<div class="card-body p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-primary-content/70 text-xs uppercase tracking-wide">Messages</p>
							<p class="text-2xl font-bold">{stream.messages.toLocaleString()}</p>
						</div>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
					</div>
				</div>
			</div>

			<div class="card bg-gradient-to-br from-secondary to-secondary/80 text-secondary-content shadow-lg">
				<div class="card-body p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-secondary-content/70 text-xs uppercase tracking-wide">Storage</p>
							<p class="text-2xl font-bold">{formatBytes(stream.bytes)}</p>
						</div>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
						</svg>
					</div>
				</div>
			</div>

			<div class="card bg-gradient-to-br from-accent to-accent/80 text-accent-content shadow-lg">
				<div class="card-body p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-accent-content/70 text-xs uppercase tracking-wide">Consumers</p>
							<p class="text-2xl font-bold">{stream.consumer_count}</p>
						</div>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</div>
				</div>
			</div>

			<div class="card bg-gradient-to-br from-info to-info/80 text-info-content shadow-lg">
				<div class="card-body p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-info-content/70 text-xs uppercase tracking-wide">Sequence</p>
							<p class="text-lg font-bold font-mono">{stream.first_seq}-{stream.last_seq}</p>
						</div>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
						</svg>
					</div>
				</div>
			</div>
		</div>

		<!-- Subjects -->
		<div class="card bg-base-100 shadow-md border border-base-200">
			<div class="card-body p-4">
				<h2 class="card-title text-lg">Subjects</h2>
				<div class="flex flex-wrap gap-2 mt-2">
					{#each stream.subjects as subject}
						<span class="badge badge-lg badge-outline font-mono">{subject}</span>
					{/each}
				</div>
			</div>
		</div>

		<!-- Config -->
		<div class="card bg-base-100 shadow-md border border-base-200">
			<div class="card-body p-4">
				<div class="flex items-center justify-between">
					<h2 class="card-title text-lg">Configuration</h2>
					<button class="btn btn-ghost btn-sm" onclick={() => showConfig = !showConfig}>
						{showConfig ? 'Hide' : 'Show'} JSON
					</button>
				</div>
				{#if showConfig}
					<div class="mt-3">
						<JsonViewer data={JSON.stringify(stream.config, null, 2)} />
					</div>
				{:else}
					<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
						<div class="bg-base-200 rounded-lg p-3">
							<p class="text-xs text-base-content/60 uppercase tracking-wide">Retention</p>
							<p class="font-medium mt-1">{stream.config.retention || 'Limits'}</p>
						</div>
						<div class="bg-base-200 rounded-lg p-3">
							<p class="text-xs text-base-content/60 uppercase tracking-wide">Max Messages</p>
							<p class="font-medium mt-1">{stream.config.max_msgs === -1 ? 'Unlimited' : stream.config.max_msgs?.toLocaleString()}</p>
						</div>
						<div class="bg-base-200 rounded-lg p-3">
							<p class="text-xs text-base-content/60 uppercase tracking-wide">Max Bytes</p>
							<p class="font-medium mt-1">{stream.config.max_bytes === -1 ? 'Unlimited' : formatBytes(stream.config.max_bytes)}</p>
						</div>
						<div class="bg-base-200 rounded-lg p-3">
							<p class="text-xs text-base-content/60 uppercase tracking-wide">Max Age</p>
							<p class="font-medium mt-1">{stream.config.max_age === 0 ? 'Unlimited' : stream.config.max_age}</p>
						</div>
						<div class="bg-base-200 rounded-lg p-3">
							<p class="text-xs text-base-content/60 uppercase tracking-wide">Storage</p>
							<p class="font-medium mt-1">{stream.config.storage || 'File'}</p>
						</div>
						<div class="bg-base-200 rounded-lg p-3">
							<p class="text-xs text-base-content/60 uppercase tracking-wide">Replicas</p>
							<p class="font-medium mt-1">{stream.config.num_replicas || 1}</p>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Consumers -->
		<div class="card bg-base-100 shadow-md border border-base-200">
			<div class="card-body p-4">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<h2 class="card-title text-lg">
						Consumers
						<span class="badge badge-primary">{consumers.length}</span>
					</h2>
					{#if consumers.length > 0}
						<div class="form-control">
							<div class="input-group input-group-sm">
								<span class="bg-base-200">
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
								</span>
								<input
									type="text"
									placeholder="Search..."
									class="input input-bordered input-sm w-full sm:w-40"
									bind:value={consumerSearch}
								/>
							</div>
						</div>
					{/if}
				</div>

				{#if consumers.length === 0}
					<div class="text-center py-6">
						<div class="text-4xl mb-2">👥</div>
						<p class="text-base-content/60">No consumers configured</p>
					</div>
				{:else if filteredConsumers().length === 0}
					<div class="text-center py-6">
						<p class="text-base-content/60">No consumers match "{consumerSearch}"</p>
						<button class="btn btn-ghost btn-sm mt-2" onclick={() => consumerSearch = ''}>Clear</button>
					</div>
				{:else}
					<!-- Mobile card view -->
					<div class="block md:hidden space-y-2 mt-3">
						{#each filteredConsumers() as consumer}
							<a href="/consumers/{streamName}/{consumer.name}" class="block bg-base-200/50 rounded-lg p-3 hover:bg-base-200 transition-colors">
								<div class="flex items-center justify-between">
									<div class="min-w-0 flex-1">
										<p class="font-medium truncate text-primary">{consumer.name}</p>
										<div class="flex gap-3 mt-1 text-sm">
											<span><span class="text-base-content/60">Pending:</span> {consumer.num_pending.toLocaleString()}</span>
											<span><span class="text-base-content/60">Ack:</span> {consumer.num_ack_pending}</span>
										</div>
									</div>
									<div class="flex items-center gap-2">
										<button
											class="btn btn-ghost btn-xs text-error"
											onclick={(e) => { e.preventDefault(); confirmDeleteConsumer(consumer); }}
										>
											Delete
										</button>
										<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
										</svg>
									</div>
								</div>
							</a>
						{/each}
					</div>

					<!-- Desktop table view -->
					<div class="hidden md:block overflow-x-auto mt-3">
						<table class="table table-zebra">
							<thead>
								<tr class="bg-base-200">
									<th>Name</th>
									<th class="text-right">Pending</th>
									<th class="text-right">Ack Pending</th>
									<th class="text-right">Redelivered</th>
									<th class="text-right">Delivered</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{#each filteredConsumers() as consumer}
									<tr class="hover">
										<td>
											<a href="/consumers/{streamName}/{consumer.name}" class="font-medium hover:text-primary">
												{consumer.name}
											</a>
										</td>
										<td class="text-right font-mono">{consumer.num_pending.toLocaleString()}</td>
										<td class="text-right font-mono">{consumer.num_ack_pending}</td>
										<td class="text-right font-mono">{consumer.num_redelivered}</td>
										<td class="text-right font-mono">{consumer.delivered?.stream_seq || 0}</td>
										<td>
											<div class="flex gap-1 justify-end">
												<a href="/consumers/{streamName}/{consumer.name}" class="btn btn-ghost btn-xs">View</a>
												<button
													class="btn btn-ghost btn-xs text-error"
													onclick={() => confirmDeleteConsumer(consumer)}
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
