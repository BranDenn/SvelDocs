<script lang="ts">
	import type { NavItem } from '$lib/docs';
    import ChevronRight from '@lucide/svelte/icons/chevron-right'
	import type { Snippet } from 'svelte';

	let { href, icon: Icon, children }: Omit<NavItem, "title"> & { children: Snippet} = $props();
</script>

<a
	{href}
	class='p-2 rounded-lg border bg-foreground text-sm flex items-center gap-2 transition-colors hover:text-accent hover:border-accent shadow'
>
	{#if Icon}
		<Icon class="size-4 shrink-0" />
	{/if}
    {@render children?.()}
    <ChevronRight class="size-4 ml-auto shrink-0" />
</a>
