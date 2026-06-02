<script>
	let { size = 40 } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 64 64"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class="inline-block"
>
	<!-- Pigeon body -->
	<ellipse cx="32" cy="34" rx="16" ry="12" fill="oklch(var(--bc) / 0.8)" />

	<!-- Pigeon head -->
	<circle cx="44" cy="24" r="8" fill="oklch(var(--bc) / 0.8)" />

	<!-- Eye -->
	<circle cx="46" cy="23" r="2" fill="oklch(var(--b1))" />
	<circle cx="46.5" cy="22.5" r="1" fill="oklch(var(--bc))" />

	<!-- Beak -->
	<polygon points="52,24 58,26 52,28" fill="oklch(var(--wa))" />

	<!-- Wing -->
	<ellipse cx="28" cy="32" rx="10" ry="6" fill="oklch(var(--bc) / 0.6)" />

	<!-- Tail feathers -->
	<polygon points="16,34 8,28 10,34 8,40 16,34" fill="oklch(var(--bc) / 0.7)" />

	<!-- Legs -->
	<line
		x1="28"
		y1="44"
		x2="26"
		y2="54"
		stroke="oklch(var(--wa))"
		stroke-width="2"
		stroke-linecap="round"
	/>
	<line
		x1="36"
		y1="44"
		x2="38"
		y2="54"
		stroke="oklch(var(--wa))"
		stroke-width="2"
		stroke-linecap="round"
	/>

	<!-- Feet -->
	<path d="M23 54 L26 54 L28 56" stroke="oklch(var(--wa))" stroke-width="2" stroke-linecap="round" />
	<path d="M35 56 L38 54 L41 54" stroke="oklch(var(--wa))" stroke-width="2" stroke-linecap="round" />

	<!-- Note/Letter attached to leg -->
	<rect x="30" y="48" width="8" height="6" rx="1" fill="oklch(var(--p))" />
	<line x1="32" y1="50" x2="36" y2="50" stroke="oklch(var(--pc))" stroke-width="0.5" />
	<line x1="32" y1="52" x2="36" y2="52" stroke="oklch(var(--pc))" stroke-width="0.5" />

	<!-- String connecting note to leg -->
	<line x1="34" y1="48" x2="36" y2="46" stroke="oklch(var(--bc) / 0.5)" stroke-width="0.5" />
</svg>
