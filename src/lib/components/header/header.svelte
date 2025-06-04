<script lang="ts">
	import MobileNav from './mobile-nav.svelte';
	import Nav from './nav.svelte';
</script>

<header class="bg-background sticky top-0 z-50 border-b">
	<Nav />

	<div class="h-header mx-4 flex items-center overflow-hidden border-t md:hidden">
		<MobileNav />
	</div>
</header>
