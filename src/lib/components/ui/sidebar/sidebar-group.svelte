<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$utils';
	import { Root as CollapsibleRoot } from '../collapsible/index';
	import { setSidebarGroupCollapsibleContext } from './sidebar-group-collapsible-context';

	let {
		ref = $bindable(null),
		collapsible = false,
		class: className,
		children,
		...restProps
	}: {
		ref?: HTMLElement | null;
		collapsible?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();

	const mergedProps = $derived({
		'data-slot': 'sidebar-group',
		class: cn('relative flex w-full flex-col', className),
		...restProps
	});

	setSidebarGroupCollapsibleContext({
		getIsCollapsible: () => collapsible
	});
</script>

{#if collapsible}
	<CollapsibleRoot bind:ref open={true} {...mergedProps}>
		{@render children?.()}
	</CollapsibleRoot>
{:else}
	<div bind:this={ref} {...mergedProps}>
		{@render children?.()}
	</div>
{/if}
