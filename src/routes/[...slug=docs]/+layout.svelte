<script lang="ts">
	import Footer from '$lib/components/footer/footer.svelte';
	import Header from '$lib/components/header';
	import * as Sidebar from '$lib/components/sidebar';
	import { SearchDialog } from '$lib/components/search';

	let { children } = $props();
</script>

<Header />
<SearchDialog />

<div class="container flex grow">
	<Sidebar.Nav />

	<div class="flex w-full flex-col gap-4 p-4 transition-[padding] lg:p-8" id="middle">
		<main class="grow">
			{@render children?.()}
		</main>
		<Footer />
	</div>

	<Sidebar.TOC />
</div>
