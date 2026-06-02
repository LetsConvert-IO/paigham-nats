<script>
	import { onMount } from 'svelte';
	import { getStreams, deleteStream, purgeStream } from '$lib/api.js';
	import { toast } from '$lib/stores/toast.js';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';

	let streams = $state([]);
	let loading = $state(true);
	let error = $state(null);

	// Search and pagination
	let searchQuery = $state('');
	let currentPage = $state(1);
	let pageSize = $state(10);

	let deleteModalOpen = $state(false);
	let purgeModalOpen = $state(false);
	let selectedStream = $state(null);

	onMount(loadStreams);

	async function loadStreams() {
		loading = true;
		error = null;
		try {
			streams = await getStreams();
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	// Filtered streams based on search
	let filteredStreams = $derived(() => {
		if (!searchQuery.trim()) return streams;
		const query = searchQuery.toLowerCase();
		return streams.filter(stream =>
			stream.name.toLowerCase().includes(query) ||
			stream.description?.toLowerCase().includes(query) ||
			stream.subjects.some(s => s.toLowerCase().includes(query))
		);
	});

	// Paginated streams
	let paginatedStreams = $derived(() => {
		const filtered = filteredStreams();
		const start = (currentPage - 1) * pageSize;
		return filtered.slice(start, start + pageSize);
	});

	// Total pages
	let totalPages = $derived(() => Math.ceil(filteredStreams().length / pageSize));

	// Reset to page 1 when search changes
	$effect(() => {
		searchQuery;
		currentPage = 1;
	});

	function confirmDelete(stream) {
		selectedStream = stream;
		deleteModalOpen = true;
	}

	function confirmPurge(stream) {
		selectedStream = stream;
		purgeModalOpen = true;
	}

	async function handleDelete() {
		if (!selectedStream) return;
		try {
			await deleteStream(selectedStream.name);
			toast.success(`Stream "${selectedStream.name}" deleted`);
			await loadStreams();
		} catch (e) {
			toast.error(`Failed to delete stream: ${e.message}`);
		}
	}

	async function handlePurge() {
		if (!selectedStream) return;
		try {
			await purgeStream(selectedStream.name);
			toast.success(`Stream "${selectedStream.name}" purged`);
			await loadStreams();
		} catch (e) {
			toast.error(`Failed to purge stream: ${e.message}`);
		}
	}

	function formatBytes(bytes) {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	function goToPage(page) {
		if (page >= 1 && page <= totalPages()) {
			currentPage = page;
		}
	}
</script>

<ConfirmModal
	bind:open={deleteModalOpen}
	title="Delete Stream"
	message="Are you sure you want to delete stream '{selectedStream?.name}'? This action cannot be undone."
	confirmText="Delete"
	onConfirm={handleDelete}
/>

<ConfirmModal
	bind:open={purgeModalOpen}
	title="Purge Stream"
	message="Are you sure you want to purge all messages from stream '{selectedStream?.name}'?"
	confirmText="Purge"
	confirmClass="btn-warning"
	onConfirm={handlePurge}
/>

<div class="space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">Streams</h1>
			<p class="text-sm text-base-content/60 mt-1">Manage your JetStream streams</p>
		</div>
		<button class="btn btn-circle btn-ghost" onclick={loadStreams} disabled={loading}>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
			</svg>
		</button>
	</div>

	<!-- Search and Filter Bar -->
	{#if !loading && !error && streams.length > 0}
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body p-3">
				<div class="flex flex-col sm:flex-row gap-3">
					<!-- Search -->
					<div class="form-control flex-1">
						<div class="input-group">
							<span class="bg-base-200">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</span>
							<input
								type="text"
								placeholder="Search streams..."
								class="input input-bordered w-full"
								bind:value={searchQuery}
							/>
							{#if searchQuery}
								<button class="btn btn-ghost" onclick={() => searchQuery = ''} aria-label="Clear search">
									<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							{/if}
						</div>
					</div>
					<!-- Page size -->
					<select class="select select-bordered w-full sm:w-auto" bind:value={pageSize}>
						<option value={10}>10 per page</option>
						<option value={25}>25 per page</option>
						<option value={50}>50 per page</option>
					</select>
				</div>
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="flex flex-col items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg text-primary"></span>
			<p class="text-base-content/60 mt-4">Loading streams...</p>
		</div>
	{:else if error}
		<div class="alert alert-error shadow-lg">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<div>
				<h3 class="font-bold">Error loading streams</h3>
				<div class="text-sm">{error}</div>
			</div>
			<button class="btn btn-sm btn-ghost" onclick={loadStreams}>Retry</button>
		</div>
	{:else if streams.length === 0}
		<div class="hero bg-base-100 rounded-box py-12">
			<div class="hero-content text-center">
				<div class="max-w-md">
					<div class="text-6xl mb-4">📭</div>
					<h2 class="text-2xl font-bold">No Streams Found</h2>
					<p class="py-4 text-base-content/60">There are no streams in this NATS server. Create a stream to get started.</p>
				</div>
			</div>
		</div>
	{:else if filteredStreams().length === 0}
		<div class="hero bg-base-100 rounded-box py-12">
			<div class="hero-content text-center">
				<div class="max-w-md">
					<div class="text-6xl mb-4">🔍</div>
					<h2 class="text-2xl font-bold">No Results</h2>
					<p class="py-4 text-base-content/60">No streams match "<span class="font-semibold">{searchQuery}</span>"</p>
					<button class="btn btn-primary btn-sm" onclick={() => searchQuery = ''}>Clear Search</button>
				</div>
			</div>
		</div>
	{:else}
		<!-- Results count -->
		<div class="flex items-center justify-between text-sm text-base-content/60 px-1">
			<span>
				Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredStreams().length)} of {filteredStreams().length}
				{#if searchQuery}<span class="badge badge-sm badge-ghost ml-2">filtered</span>{/if}
			</span>
		</div>

		<!-- Mobile card view -->
		<div class="block md:hidden space-y-3">
			{#each paginatedStreams() as stream}
				<div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow border border-base-200">
					<div class="card-body p-4">
						<!-- Header with name and menu -->
						<div class="flex items-start justify-between gap-2">
							<div class="flex-1 min-w-0">
								<a href="/streams/{stream.name}" class="text-lg font-bold text-primary hover:underline line-clamp-1">
									{stream.name}
								</a>
								{#if stream.description}
									<p class="text-sm text-base-content/60 mt-0.5 line-clamp-1">{stream.description}</p>
								{/if}
							</div>
							<div class="dropdown dropdown-end">
								<button tabindex="0" class="btn btn-ghost btn-sm btn-square">
									<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
									</svg>
								</button>
								<ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-48 border border-base-200">
									<li><a href="/streams/{stream.name}" class="flex items-center gap-2">
										<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
										View Details
									</a></li>
									<li><a href="/streams/{stream.name}/messages" class="flex items-center gap-2">
										<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
										View Messages
									</a></li>
									<div class="divider my-1"></div>
									<li><button onclick={() => confirmPurge(stream)} class="flex items-center gap-2 text-warning">
										<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
										Purge Messages
									</button></li>
									<li><button onclick={() => confirmDelete(stream)} class="flex items-center gap-2 text-error">
										<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
										</svg>
										Delete Stream
									</button></li>
								</ul>
							</div>
						</div>

						<!-- Subjects -->
						<div class="flex flex-wrap gap-1.5 mt-2">
							{#each stream.subjects.slice(0, 3) as subject}
								<span class="badge badge-outline badge-sm font-mono">{subject}</span>
							{/each}
							{#if stream.subjects.length > 3}
								<span class="badge badge-ghost badge-sm">+{stream.subjects.length - 3} more</span>
							{/if}
						</div>

						<!-- Stats -->
						<div class="grid grid-cols-3 gap-2 mt-3">
							<div class="bg-primary/10 rounded-lg p-2 text-center">
								<div class="text-xs text-primary font-medium uppercase tracking-wide">Messages</div>
								<div class="text-lg font-bold text-primary">{stream.messages.toLocaleString()}</div>
							</div>
							<div class="bg-secondary/10 rounded-lg p-2 text-center">
								<div class="text-xs text-secondary font-medium uppercase tracking-wide">Storage</div>
								<div class="text-lg font-bold text-secondary">{formatBytes(stream.bytes)}</div>
							</div>
							<div class="bg-accent/10 rounded-lg p-2 text-center">
								<div class="text-xs text-accent font-medium uppercase tracking-wide">Consumers</div>
								<div class="text-lg font-bold text-accent">{stream.consumer_count}</div>
							</div>
						</div>

						<!-- Quick actions -->
						<div class="flex gap-2 mt-3">
							<a href="/streams/{stream.name}" class="btn btn-primary btn-sm flex-1">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
								</svg>
								Details
							</a>
							<a href="/streams/{stream.name}/messages" class="btn btn-outline btn-sm flex-1">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
								Messages
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Desktop table view -->
		<div class="hidden md:block card bg-base-100 shadow-md border border-base-200">
			<div class="overflow-x-auto">
				<table class="table table-zebra">
					<thead>
						<tr class="bg-base-200">
							<th>Name</th>
							<th>Subjects</th>
							<th class="text-right">Messages</th>
							<th class="text-right">Storage</th>
							<th class="text-right">Consumers</th>
							<th>Created</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each paginatedStreams() as stream}
							<tr class="hover">
								<td>
									<div class="flex items-center gap-3">
										<div class="avatar placeholder">
											<div class="bg-primary text-primary-content rounded-lg w-10">
												<span class="text-lg">{stream.name.charAt(0).toUpperCase()}</span>
											</div>
										</div>
										<div>
											<a href="/streams/{stream.name}" class="font-bold hover:text-primary">
												{stream.name}
											</a>
											{#if stream.description}
												<p class="text-xs text-base-content/60 max-w-xs truncate">{stream.description}</p>
											{/if}
										</div>
									</div>
								</td>
								<td>
									<div class="flex flex-wrap gap-1 max-w-xs">
										{#each stream.subjects.slice(0, 2) as subject}
											<span class="badge badge-outline badge-sm font-mono">{subject}</span>
										{/each}
										{#if stream.subjects.length > 2}
											<span class="badge badge-ghost badge-sm">+{stream.subjects.length - 2}</span>
										{/if}
									</div>
								</td>
								<td class="text-right font-mono">{stream.messages.toLocaleString()}</td>
								<td class="text-right font-mono">{formatBytes(stream.bytes)}</td>
								<td class="text-right">
									<span class="badge badge-primary badge-sm">{stream.consumer_count}</span>
								</td>
								<td class="text-sm text-base-content/60">
									{new Date(stream.created).toLocaleDateString()}
								</td>
								<td>
									<div class="flex gap-1">
										<a href="/streams/{stream.name}" class="btn btn-ghost btn-xs" title="View details">
											<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
											</svg>
										</a>
										<div class="dropdown dropdown-end">
											<button tabindex="0" class="btn btn-ghost btn-xs">
												<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
												</svg>
											</button>
											<ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-44 border border-base-200">
												<li><a href="/streams/{stream.name}/messages">View Messages</a></li>
												<li><button onclick={() => confirmPurge(stream)} class="text-warning">Purge</button></li>
												<li><button onclick={() => confirmDelete(stream)} class="text-error">Delete</button></li>
											</ul>
										</div>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Pagination -->
		{#if totalPages() > 1}
			<div class="flex justify-center">
				<div class="join shadow-sm">
					<button
						class="join-item btn btn-sm"
						onclick={() => goToPage(1)}
						disabled={currentPage === 1}
						aria-label="First page"
					>
						«
					</button>
					<button
						class="join-item btn btn-sm"
						onclick={() => goToPage(currentPage - 1)}
						disabled={currentPage === 1}
						aria-label="Previous page"
					>
						‹
					</button>

					{#each Array.from({ length: Math.min(5, totalPages()) }, (_, i) => {
						const total = totalPages();
						if (total <= 5) return i + 1;
						if (currentPage <= 3) return i + 1;
						if (currentPage >= total - 2) return total - 4 + i;
						return currentPage - 2 + i;
					}) as page}
						<button
							class="join-item btn btn-sm {currentPage === page ? 'btn-active btn-primary' : ''}"
							onclick={() => goToPage(page)}
						>
							{page}
						</button>
					{/each}

					<button
						class="join-item btn btn-sm"
						onclick={() => goToPage(currentPage + 1)}
						disabled={currentPage === totalPages()}
						aria-label="Next page"
					>
						›
					</button>
					<button
						class="join-item btn btn-sm"
						onclick={() => goToPage(totalPages())}
						disabled={currentPage === totalPages()}
						aria-label="Last page"
					>
						»
					</button>
				</div>
			</div>
		{/if}
	{/if}
</div>
