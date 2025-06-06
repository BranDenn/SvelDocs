<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import { browser } from '$app/environment';
	import type { ClassValue } from 'svelte/elements';
	import { cn } from '$lib';
	import { getContext } from 'svelte';
	import type { OPEN } from '.';

	let { class: className, mode = 'desktop' }: { class?: ClassValue; mode?: 'desktop' | 'mobile' } =
		$props();

	const open : OPEN = getContext('search-dialog')
</script>

<button
	onclick={() => open.current = !open.current}
	class={cn(
		mode === 'desktop' &&
			'bg-foreground hover:border-accent/50 hidden w-full items-center gap-2 rounded-lg border p-2 text-sm text-xs font-medium md:flex',
		mode === 'mobile' && 'p-1 md:hidden',
		'text-secondary hover:text-primary transition-colors',
		className
	)}
>
	<Search class={mode === 'desktop' ? 'size-4' : 'size-5'} />
	{#if mode === 'desktop'}
		Search Docs...
		{#if browser}
			<kbd class="ml-auto text-xs font-bold">
				{navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl'} K
			</kbd>
		{/if}
	{/if}
</button>
