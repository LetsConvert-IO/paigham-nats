<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth.js';
	import { getLoginUrl } from '$lib/api.js';
	import Toast from '$lib/components/Toast.svelte';
	import Logo from '$lib/components/Logo.svelte';

	let { children } = $props();

	let sidebarOpen = $state(false);
	let theme = $state('corporate');

	onMount(() => {
		auth.init();
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			theme = savedTheme;
			document.documentElement.setAttribute('data-theme', theme);
		}
	});

	function toggleTheme() {
		theme = theme === 'corporate' ? 'business' : 'corporate';
		localStorage.setItem('theme', theme);
		document.documentElement.setAttribute('data-theme', theme);
	}

	function handleLogout() {
		auth.logout();
	}

	function closeSidebar() {
		sidebarOpen = false;
	}
</script>

<svelte:head>
	<title>Paigham - NATS JetStream Manager</title>
</svelte:head>

<Toast />

{#if $auth.loading}
	<div class="flex items-center justify-center min-h-screen">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{:else if !$auth.authenticated && $auth.authEnabled}
	<!-- Login page -->
	<div class="flex items-center justify-center min-h-screen bg-base-200">
		<div class="card w-96 bg-base-100 shadow-xl">
			<div class="card-body items-center text-center">
				<Logo size={80} />
				<h1 class="card-title text-3xl mt-4">Paigham</h1>
				<p class="text-base-content/70">NATS JetStream Manager</p>
				<div class="card-actions mt-6">
					<a href={getLoginUrl()} class="btn btn-primary gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="currentColor"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="currentColor"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="currentColor"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Sign in with Google
					</a>
				</div>
			</div>
		</div>
	</div>
{:else}
	<!-- Main app layout -->
	<div class="drawer md:drawer-open">
		<input id="sidebar" type="checkbox" class="drawer-toggle" bind:checked={sidebarOpen} />

		<div class="drawer-content flex flex-col min-h-screen">
			<!-- Navbar -->
			<div class="navbar bg-base-100 border-b border-base-200 sticky top-0 z-30">
				<div class="flex-none md:hidden">
					<label for="sidebar" class="btn btn-square btn-ghost">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="inline-block w-6 h-6 stroke-current"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							></path>
						</svg>
					</label>
				</div>
				<div class="flex-1">
					<span class="text-xl font-semibold md:hidden">Paigham</span>
				</div>
				<div class="flex-none gap-2">
					<!-- Theme toggle -->
					<label class="swap swap-rotate btn btn-ghost btn-circle">
						<input type="checkbox" checked={theme === 'business'} onchange={toggleTheme} />
						<svg class="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/>
						</svg>
						<svg class="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/>
						</svg>
					</label>

					<!-- User menu -->
					{#if $auth.authenticated}
						<div class="dropdown dropdown-end">
							<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar placeholder">
								{#if $auth.user?.picture}
									<div class="w-10 rounded-full">
										<img alt={$auth.user.name} src={$auth.user.picture} />
									</div>
								{:else}
									<div class="bg-neutral text-neutral-content rounded-full w-10">
										<span>{$auth.user?.name?.charAt(0) || 'U'}</span>
									</div>
								{/if}
							</div>
							<ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
								<li class="menu-title">{$auth.user?.email || 'User'}</li>
								{#if $auth.authEnabled}
									<li><button onclick={handleLogout}>Logout</button></li>
								{/if}
							</ul>
						</div>
					{/if}
				</div>
			</div>

			<!-- Main content -->
			<main class="flex-1 p-4 md:p-6 bg-base-200">
				{@render children()}
			</main>
		</div>

		<!-- Sidebar -->
		<div class="drawer-side z-40">
			<label for="sidebar" aria-label="close sidebar" class="drawer-overlay"></label>
			<aside class="bg-base-100 w-64 min-h-full border-r border-base-200">
				<div class="sticky top-0 bg-base-100 p-4 border-b border-base-200">
					<a href="/" class="flex items-center gap-3">
						<Logo size={40} />
						<div>
							<h1 class="text-xl font-bold">Paigham</h1>
							<p class="text-xs text-base-content/60">NATS JetStream</p>
						</div>
					</a>
				</div>
				<ul class="menu p-4 gap-1">
					<li>
						<a href="/" class="flex items-center gap-3" onclick={closeSidebar}>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
							</svg>
							Dashboard
						</a>
					</li>
					<li>
						<a href="/streams" class="flex items-center gap-3" onclick={closeSidebar}>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
							Streams
						</a>
					</li>
				</ul>
				<div class="absolute bottom-0 left-0 right-0 p-4 border-t border-base-200">
					<span class="text-xs text-base-content/40 font-mono">v1.0.2</span>
				</div>
			</aside>
		</div>
	</div>
{/if}
