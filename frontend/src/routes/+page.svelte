<script>
	import { onMount } from 'svelte';
	import { getStreams, getHealth } from '$lib/api.js';

	let streams = $state([]);
	let health = $state(null);
	let loading = $state(true);
	let error = $state(null);

	onMount(async () => {
		try {
			const [streamsData, healthData] = await Promise.all([
				getStreams(),
				getHealth()
			]);
			streams = streamsData;
			health = healthData;
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	});

	let totalMessages = $derived(streams.reduce((sum, s) => sum + s.messages, 0));
	let totalBytes = $derived(streams.reduce((sum, s) => sum + s.bytes, 0));
	let totalConsumers = $derived(streams.reduce((sum, s) => sum + s.consumer_count, 0));

	function formatBytes(bytes) {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
		<div>
			<h1 class="text-2xl font-bold">Dashboard</h1>
			<p class="text-sm text-base-content/60 mt-1">Overview of your NATS JetStream</p>
		</div>
		{#if health}
			<div class="flex items-center gap-2 bg-base-100 px-4 py-2 rounded-full shadow-sm border border-base-200">
				<span class="relative flex h-3 w-3">
					{#if health.nats === 'connected'}
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
						<span class="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
					{:else}
						<span class="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
					{/if}
				</span>
				<span class="text-sm font-medium">NATS {health.nats}</span>
			</div>
		{/if}
	</div>

	{#if loading}
		<div class="flex flex-col items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg text-primary"></span>
			<p class="text-base-content/60 mt-4">Loading dashboard...</p>
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
		</div>
	{:else}
		<!-- Stats cards - Mobile optimized grid -->
		<div class="grid grid-cols-2 gap-3 sm:gap-4">
			<div class="card bg-gradient-to-br from-primary to-primary/80 text-primary-content shadow-lg">
				<div class="card-body p-4 sm:p-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-primary-content/70 text-xs sm:text-sm uppercase tracking-wide">Streams</p>
							<p class="text-2xl sm:text-3xl font-bold mt-1">{streams.length}</p>
						</div>
						<div class="bg-white/20 p-2 sm:p-3 rounded-full">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
						</div>
					</div>
				</div>
			</div>

			<div class="card bg-gradient-to-br from-secondary to-secondary/80 text-secondary-content shadow-lg">
				<div class="card-body p-4 sm:p-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-secondary-content/70 text-xs sm:text-sm uppercase tracking-wide">Messages</p>
							<p class="text-2xl sm:text-3xl font-bold mt-1">{totalMessages.toLocaleString()}</p>
						</div>
						<div class="bg-white/20 p-2 sm:p-3 rounded-full">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
						</div>
					</div>
				</div>
			</div>

			<div class="card bg-gradient-to-br from-accent to-accent/80 text-accent-content shadow-lg">
				<div class="card-body p-4 sm:p-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-accent-content/70 text-xs sm:text-sm uppercase tracking-wide">Consumers</p>
							<p class="text-2xl sm:text-3xl font-bold mt-1">{totalConsumers}</p>
						</div>
						<div class="bg-white/20 p-2 sm:p-3 rounded-full">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
					</div>
				</div>
			</div>

			<div class="card bg-gradient-to-br from-info to-info/80 text-info-content shadow-lg">
				<div class="card-body p-4 sm:p-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-info-content/70 text-xs sm:text-sm uppercase tracking-wide">Storage</p>
							<p class="text-xl sm:text-2xl font-bold mt-1">{formatBytes(totalBytes)}</p>
						</div>
						<div class="bg-white/20 p-2 sm:p-3 rounded-full">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
							</svg>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Recent streams -->
		{#if streams.length > 0}
			<div class="card bg-base-100 shadow-md border border-base-200">
				<div class="card-body p-4 sm:p-6">
					<div class="flex items-center justify-between mb-4">
						<h2 class="card-title text-lg">Recent Streams</h2>
						<a href="/streams" class="btn btn-ghost btn-sm">
							View all
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</a>
					</div>

					<!-- Mobile list -->
					<div class="block md:hidden space-y-2">
						{#each streams.slice(0, 5) as stream}
							<a href="/streams/{stream.name}" class="flex items-center justify-between p-3 bg-base-200/50 rounded-lg hover:bg-base-200 transition-colors">
								<div class="flex items-center gap-3 min-w-0">
									<div class="avatar placeholder">
										<div class="bg-primary text-primary-content rounded-lg w-10">
											<span class="text-sm font-bold">{stream.name.charAt(0).toUpperCase()}</span>
										</div>
									</div>
									<div class="min-w-0">
										<p class="font-medium truncate">{stream.name}</p>
										<p class="text-xs text-base-content/60">{stream.messages.toLocaleString()} messages</p>
									</div>
								</div>
								<div class="flex items-center gap-2">
									<span class="badge badge-sm">{stream.consumer_count}</span>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
									</svg>
								</div>
							</a>
						{/each}
					</div>

					<!-- Desktop table -->
					<div class="hidden md:block overflow-x-auto">
						<table class="table">
							<thead>
								<tr>
									<th>Name</th>
									<th>Subjects</th>
									<th class="text-right">Messages</th>
									<th class="text-right">Consumers</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{#each streams.slice(0, 5) as stream}
									<tr class="hover">
										<td>
											<div class="flex items-center gap-3">
												<div class="avatar placeholder">
													<div class="bg-primary text-primary-content rounded-lg w-8">
														<span class="text-sm">{stream.name.charAt(0).toUpperCase()}</span>
													</div>
												</div>
												<span class="font-medium">{stream.name}</span>
											</div>
										</td>
										<td>
											<div class="flex flex-wrap gap-1">
												{#each stream.subjects.slice(0, 2) as subject}
													<span class="badge badge-outline badge-sm">{subject}</span>
												{/each}
												{#if stream.subjects.length > 2}
													<span class="badge badge-ghost badge-sm">+{stream.subjects.length - 2}</span>
												{/if}
											</div>
										</td>
										<td class="text-right font-mono">{stream.messages.toLocaleString()}</td>
										<td class="text-right">
											<span class="badge badge-primary badge-sm">{stream.consumer_count}</span>
										</td>
										<td>
											<a href="/streams/{stream.name}" class="btn btn-ghost btn-xs">View</a>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{:else}
			<div class="hero bg-base-100 rounded-box py-12 shadow-md border border-base-200">
				<div class="hero-content text-center">
					<div class="max-w-md">
						<div class="text-6xl mb-4">🚀</div>
						<h2 class="text-2xl font-bold">Welcome to Paigham</h2>
						<p class="py-4 text-base-content/60">No streams found. Create a stream in your NATS server to start managing messages.</p>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>
