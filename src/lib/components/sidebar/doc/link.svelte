<script lang="ts">
	import { page } from '$app/state';
	import type { NavItem } from '$lib/docs';
	import Link from '$lib/components/ui/link/link.svelte';
	import { resolve } from '$app/paths';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { cn } from '$utils';
	import { SETTINGS } from '$lib/docs/docs.config';

	type Props = NavItem & HTMLAnchorAttributes;

	let { title, href, icon: Icon, class: className }: Props = $props();

	let isActive: boolean = $derived(page.url.pathname === resolve(`/${href}`));
</script>

{#if SETTINGS.NAV_STYLE === 'button'}
	<Link
		{href}
		class={cn(
			'mb-px rounded-full px-4 py-1.5 transition-all',
			isActive
				? 'text-accent bg-accent/5 font-bold'
				: 'text-muted-foreground hover:text-foreground hover:bg-foreground/5 font-medium',
			Icon && 'flex items-center gap-2',
			className
		)}
	>
		{#if Icon}
			{#if typeof Icon === 'string'}
				<span class="size-4 shrink-0">{Icon}</span>
			{:else}
				<Icon class={['size-4 shrink-0', isActive && 'stroke-[2.5]']} />
			{/if}
		{/if}
		{title}
	</Link>
{:else if SETTINGS.NAV_STYLE === 'left-border'}
	<Link
		{href}
		class={cn(
			'ml-4 border-l px-4 py-1.5 transition-all',
			isActive
				? 'text-accent border-accent pl-6 font-bold'
				: 'text-muted-foreground hover:text-foreground hover:border-foreground font-medium',
			Icon && 'flex items-center gap-2',
			className
		)}
	>
		{#if Icon}
			{#if typeof Icon === 'string'}
				<span class="size-4 shrink-0">{Icon}</span>
			{:else}
				<Icon class={['size-4 shrink-0', isActive && 'stroke-[2.5]']} />
			{/if}
		{/if}
		{title}
	</Link>
{/if}
