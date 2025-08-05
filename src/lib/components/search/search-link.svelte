<script lang="ts">
	import type { NavItem } from '$lib/docs';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Snippet } from 'svelte';
	import A from '$lib/components/ui/a/a.svelte';

	let { href, icon: Icon, children }: Omit<NavItem, 'title'> & { children: Snippet } = $props();
</script>

<A
	{href}
	class="bg-foreground hover:text-accent hover:border-accent flex items-center gap-2 rounded-lg border p-2 text-sm shadow transition-colors"
>
	{#if Icon}
		<Icon class="size-4 shrink-0" />
	{/if}
	{@render children?.()}
	<ChevronRight class="ml-auto size-4 shrink-0" />
</A>
