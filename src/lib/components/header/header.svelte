<script lang="ts">
	import MobileNav from './mobile-nav.svelte';
	import Nav from './nav.svelte';
</script>

<header class="bg-background sticky top-0 z-30 border-b">
	<Nav />

	<div
		class="h-header lg:-mt-header container flex items-center overflow-hidden border-t px-4 transition-[margin] duration-300"
	>
		<MobileNav />
	</div>
</header>
