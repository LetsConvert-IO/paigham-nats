<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { getMessages, getMessage, deleteMessage } from '$lib/api.js';
	import { toast } from '$lib/stores/toast.js';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import JsonViewer from '$lib/components/JsonViewer.svelte';

	let messages = $state([]);
	let loading = $state(true);
	let error = $state(null);

	let startSeq = $state(0);
	let limit = $state(50);

	// Search
	let searchQuery = $state('');

	let selectedMessage = $state(null);
	let messageDetailOpen = $state(false);
	let deleteModalOpen = $state(false);
	let messageToDelete = $state(null);

	let streamName = $derived($page.params.name);

	onMount(loadMessages);

	async function loadMessages() {
		loading = true;
		error = null;
		try {
			messages = await getMessages(streamName, startSeq, limit);
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	// Filtered messages based on search
	let filteredMessages = $derived(() => {
		if (!searchQuery.trim()) return messages;
		const query = searchQuery.toLowerCase();
		return messages.filter(msg =>
			msg.subject.toLowerCase().includes(query) ||
			msg.data.toLowerCase().includes(query) ||
			String(msg.sequence).includes(query)
		);
	});

	async function viewMessage(seq) {
		try {
			selectedMessage = await getMessage(streamName, seq);
			messageDetailOpen = true;
		} catch (e) {
			toast.error(`Failed to load message: ${e.message}`);
		}
	}

	function confirmDelete(msg) {
		messageToDelete = msg;
		deleteModalOpen = true;
	}

	async function handleDelete() {
		if (!messageToDelete) return;
		try {
			await deleteMessage(streamName, messageToDelete.sequence);
			toast.success(`Message ${messageToDelete.sequence} deleted`);
			await loadMessages();
			messageDetailOpen = false;
		} catch (e) {
			toast.error(`Failed to delete message: ${e.message}`);
		}
	}

	function loadNext() {
		if (messages.length > 0) {
			startSeq = messages[messages.length - 1].sequence + 1;
			loadMessages();
		}
	}

	function loadPrev() {
		if (messages.length > 0 && startSeq > 0) {
			startSeq = Math.max(0, messages[0].sequence - limit);
			loadMessages();
		}
	}

	function formatTime(time) {
		return new Date(time).toLocaleString();
	}

	function formatTimeShort(time) {
		const d = new Date(time);
		return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function isJSON(str) {
		try {
			JSON.parse(str);
			return true;
		} catch {
			return false;
		}
	}
</script>

<ConfirmModal
	bind:open={deleteModalOpen}
	title="Delete Message"
	message="Are you sure you want to delete message sequence {messageToDelete?.sequence}?"
	confirmText="Delete"
	onConfirm={handleDelete}
/>

<!-- Message Detail Modal -->
<dialog class="modal modal-bottom sm:modal-middle" class:modal-open={messageDetailOpen}>
	<div class="modal-box w-full max-w-3xl">
		{#if selectedMessage}
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-bold flex items-center gap-2">
					<span class="badge badge-primary">#{selectedMessage.sequence}</span>
					Message Details
				</h3>
				<button class="btn btn-ghost btn-sm btn-circle" onclick={() => messageDetailOpen = false}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-4">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="bg-base-200 rounded-lg p-3">
						<p class="text-xs text-base-content/60 uppercase tracking-wide">Subject</p>
						<p class="font-mono font-medium break-all mt-1">{selectedMessage.subject}</p>
					</div>
					<div class="bg-base-200 rounded-lg p-3">
						<p class="text-xs text-base-content/60 uppercase tracking-wide">Time</p>
						<p class="font-medium mt-1">{formatTime(selectedMessage.time)}</p>
					</div>
				</div>

				{#if Object.keys(selectedMessage.headers || {}).length > 0}
					<div class="bg-base-200 rounded-lg p-3">
						<p class="text-xs text-base-content/60 uppercase tracking-wide mb-2">Headers</p>
						<div class="space-y-1">
							{#each Object.entries(selectedMessage.headers) as [key, value]}
								<div class="flex gap-2 text-sm">
									<span class="font-medium text-primary">{key}:</span>
									<span class="break-all">{value}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<div>
					<p class="text-xs text-base-content/60 uppercase tracking-wide mb-2">Data</p>
					{#if isJSON(selectedMessage.data)}
						<JsonViewer data={selectedMessage.data} />
					{:else}
						<pre class="bg-base-200 rounded-lg p-4 overflow-auto max-h-64 whitespace-pre-wrap break-all text-sm font-mono">{selectedMessage.data}</pre>
					{/if}
				</div>
			</div>

			<div class="modal-action">
				<button class="btn btn-error btn-sm" onclick={() => confirmDelete(selectedMessage)}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
					Delete
				</button>
				<button class="btn btn-sm" onclick={() => messageDetailOpen = false}>Close</button>
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={() => messageDetailOpen = false}>close</button>
	</form>
</dialog>

<div class="space-y-4">
	<!-- Breadcrumb -->
	<div class="text-sm breadcrumbs">
		<ul>
			<li><a href="/streams" class="text-primary">Streams</a></li>
			<li><a href="/streams/{streamName}" class="text-primary max-w-[120px] truncate inline-block">{streamName}</a></li>
			<li class="font-medium">Messages</li>
		</ul>
	</div>

	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold">Messages</h1>
			<p class="text-sm text-base-content/60 mt-1">Browse messages in {streamName}</p>
		</div>
	</div>

	<!-- Controls -->
	<div class="card bg-base-100 shadow-sm border border-base-200">
		<div class="card-body p-3">
			<div class="flex flex-col sm:flex-row gap-3">
				<div class="join flex-1">
					<input
						type="number"
						placeholder="Start sequence"
						class="input input-bordered join-item w-full sm:w-32"
						bind:value={startSeq}
					/>
					<select class="select select-bordered join-item" bind:value={limit}>
						<option value={25}>25</option>
						<option value={50}>50</option>
						<option value={100}>100</option>
					</select>
					<button class="btn btn-primary join-item" onclick={loadMessages} disabled={loading}>
						{#if loading}
							<span class="loading loading-spinner loading-sm"></span>
						{:else}
							Load
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Search (only show when messages loaded) -->
	{#if !loading && !error && messages.length > 0}
		<div class="form-control">
			<div class="input-group">
				<span class="bg-base-200">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</span>
				<input
					type="text"
					placeholder="Search in loaded messages..."
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
	{/if}

	{#if loading}
		<div class="flex flex-col items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg text-primary"></span>
			<p class="text-base-content/60 mt-4">Loading messages...</p>
		</div>
	{:else if error}
		<div class="alert alert-error shadow-lg">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<div>
				<h3 class="font-bold">Error loading messages</h3>
				<div class="text-sm">{error}</div>
			</div>
			<button class="btn btn-sm btn-ghost" onclick={loadMessages}>Retry</button>
		</div>
	{:else if messages.length === 0}
		<div class="hero bg-base-100 rounded-box py-12 shadow-sm border border-base-200">
			<div class="hero-content text-center">
				<div class="max-w-md">
					<div class="text-6xl mb-4">📭</div>
					<h2 class="text-2xl font-bold">No Messages</h2>
					<p class="py-4 text-base-content/60">No messages found in this sequence range.</p>
				</div>
			</div>
		</div>
	{:else if filteredMessages().length === 0}
		<div class="hero bg-base-100 rounded-box py-12 shadow-sm border border-base-200">
			<div class="hero-content text-center">
				<div class="max-w-md">
					<div class="text-6xl mb-4">🔍</div>
					<h2 class="text-2xl font-bold">No Results</h2>
					<p class="py-4 text-base-content/60">No messages match "<span class="font-semibold">{searchQuery}</span>"</p>
					<button class="btn btn-primary btn-sm" onclick={() => searchQuery = ''}>Clear Search</button>
				</div>
			</div>
		</div>
	{:else}
		<!-- Results info -->
		<div class="flex items-center justify-between text-sm text-base-content/60 px-1">
			<span>
				{filteredMessages().length} messages
				{#if searchQuery}<span class="badge badge-sm badge-ghost ml-2">filtered</span>{/if}
			</span>
		</div>

		<!-- Mobile card view -->
		<div class="block md:hidden space-y-3">
			{#each filteredMessages() as msg}
				<div class="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-all">
					<div class="card-body p-4">
						<div class="flex items-start justify-between gap-2">
							<button class="flex-1 min-w-0 text-left" onclick={() => viewMessage(msg.sequence)}>
								<div class="flex items-center gap-2 flex-wrap">
									<span class="badge badge-primary badge-sm font-mono">#{msg.sequence}</span>
									<span class="badge badge-outline badge-sm font-mono truncate max-w-[150px]">{msg.subject}</span>
								</div>
								<p class="text-xs text-base-content/60 mt-2">{formatTimeShort(msg.time)}</p>
							</button>
							<button
								class="btn btn-ghost btn-sm btn-square text-error flex-shrink-0"
								onclick={() => confirmDelete(msg)}
								aria-label="Delete message"
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>
						<button class="mt-2 bg-base-200 rounded-lg p-3 w-full text-left" onclick={() => viewMessage(msg.sequence)}>
							<pre class="font-mono text-xs line-clamp-2 whitespace-pre-wrap break-all">{msg.data}</pre>
						</button>
					</div>
				</div>
			{/each}
		</div>

		<!-- Desktop table view -->
		<div class="hidden md:block card bg-base-100 shadow-sm border border-base-200">
			<div class="overflow-x-auto">
				<table class="table table-zebra">
					<thead>
						<tr class="bg-base-200">
							<th>Seq</th>
							<th>Subject</th>
							<th>Data Preview</th>
							<th>Time</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each filteredMessages() as msg}
							<tr class="hover cursor-pointer" onclick={() => viewMessage(msg.sequence)}>
								<td>
									<span class="badge badge-primary badge-sm font-mono">#{msg.sequence}</span>
								</td>
								<td>
									<span class="badge badge-outline font-mono">{msg.subject}</span>
								</td>
								<td class="max-w-xs">
									<pre class="truncate font-mono text-sm text-base-content/70">{msg.data.substring(0, 80)}{msg.data.length > 80 ? '...' : ''}</pre>
								</td>
								<td class="text-sm text-base-content/60">{formatTime(msg.time)}</td>
								<td>
									<button
										class="btn btn-ghost btn-sm text-error"
										onclick={(e) => { e.stopPropagation(); confirmDelete(msg); }}
									>
										Delete
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Pagination -->
		<div class="flex justify-center">
			<div class="join shadow-sm">
				<button class="join-item btn" onclick={loadPrev} disabled={startSeq === 0}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
					Previous
				</button>
				<button class="join-item btn btn-disabled">
					{messages.length} loaded
				</button>
				<button class="join-item btn" onclick={loadNext} disabled={messages.length < limit}>
					Next
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</div>
		</div>
	{/if}
</div>
