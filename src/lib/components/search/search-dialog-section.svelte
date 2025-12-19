<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getSearchContext } from './search-context.svelte';
	import Highlight from '$ui/highlight';

	let { children, title }: { children: Snippet; title: string } = $props();

	const searchContext = getSearchContext();
</script>

<section class="group">
	<header class="pointer-events-none sticky top-0">
		<h1 class="bg-background pointer-events-auto px-4 pt-4 font-medium">
			<Highlight text={title} query={searchContext.cleanQuery} />
		</h1>
		<div class="from-background sticky top-0 h-4 bg-linear-to-b"></div>
	</header>

	<div class="flex flex-col gap-2 px-4 pb-4 group-last-of-type:pb-0">
		{@render children?.()}
	</div>
</section>
