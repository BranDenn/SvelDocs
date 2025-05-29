<script lang="ts">
	import Footer from '$lib/components/footer/footer.svelte';
	import Header from '$lib/components/header';
	import * as Sidebar from '$lib/components/sidebar'

	let { children } = $props();
</script>

<Header />

<div class="container flex grow">
	<Sidebar.Nav />

	<div class="flex p-8 flex-col grow gap-4">
		<main class="grow">
			{@render children?.()}
		</main>
		<Footer />
	</div>

	<Sidebar.TOC />
</div>