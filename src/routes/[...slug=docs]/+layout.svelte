<script lang="ts">
	import Footer from '$lib/components/footer/footer.svelte';
	import Header from '$lib/components/header';
	import * as Sidebar from '$lib/components/sidebar';
	import { SearchDialog } from '$lib/components/search';
	import { setContext } from 'svelte';

	let { children } = $props();

	let open = $state({ current: false });
	setContext('search-dialog', open);
	
</script>

<Header />
<SearchDialog />

<div class="container flex grow">
	<Sidebar.Nav />

	<!-- must have min-w-0 to ensure middle content does not push sidebars -->
	<div
		class="flex w-full min-w-0 flex-col gap-4 p-4 wrap-break-word transition-[padding] lg:p-8"
		id="middle"
	>
		<main class="grow">
			{@render children?.()}
		</main>
		<Footer />
	</div>

	<Sidebar.TOC />
</div>
