<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Snippet } from 'svelte';
	import { getSearch, type ItemInputData } from './context.svelte';
	import Highlighter from '$ui/highlighter';

	let {
		href,
		icon: Icon,
		title,
		children
	}: Pick<ItemInputData, 'href' | 'icon' | 'title'> & {
		children?: Snippet;
	} = $props();

	const searchContext = getSearch();
</script>

<a
	{href}
	class="bg-card hover:bg-muted flex items-center gap-2 rounded-sm border p-2 text-sm shadow transition-colors"
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
					<Highlighter text={title} query={searchContext.cleanQuery} />
				</h3>
			</div>
		{:else}
			<h3 class="font-medium">
				<Highlighter text={title} query={searchContext.cleanQuery} />
			</h3>
		{/if}
		{@render children?.()}
	</div>
	<ChevronRight class="ml-auto size-4 shrink-0" />
</a>
