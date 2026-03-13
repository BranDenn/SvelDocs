<script lang="ts">
	import type { NavItem } from '$lib/docs';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Snippet } from 'svelte';
	import { Link } from '$ui/link';
	import { getSearchContext } from './search-context.svelte';
	import Highlight from '$components/ui/highlighter';

	let { href, icon: Icon, title, children }: NavItem & { children?: Snippet } = $props();

	const searchContext = getSearchContext();
</script>

<Link
	{href}
	class="bg-secondary hover:bg-primary flex items-center gap-2 rounded-lg border p-2 text-sm shadow transition-colors"
>
	<div class="flex flex-col gap-1">
		{#if Icon}
			<div class="flex items-center gap-2">
				{#if typeof Icon === 'string'}
					<span class="size-4 shrink-0">{Icon}</span>
				{:else}
					<Icon class="size-4 shrink-0" />
				{/if}
				<h3 class="font-medium">
					<Highlight text={title} query={searchContext.cleanQuery} />
				</h3>
			</div>
		{:else}
			<h3 class="font-medium">
				<Highlight text={title} query={searchContext.cleanQuery} />
			</h3>
		{/if}
		{@render children?.()}
	</div>
	<ChevronRight class="ml-auto size-4 shrink-0" />
</Link>
