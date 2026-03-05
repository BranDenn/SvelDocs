<script lang="ts">
	import { cn } from '$utils';
	import type { Snippet } from 'svelte';
	import { Trigger as CollapsibleTrigger } from '../collapsible/index';
	import { getSidebarGroupCollapsibleContext } from './sidebar-group-collapsible-context';

	let {
		ref = $bindable(null),
		children,
		child,
		class: className,
		...restProps
	}: {
		ref?: HTMLElement | null;
		children?: Snippet;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		class?: string;
		[key: string]: unknown;
	} = $props();

	const mergedProps = $derived({
		class: cn(
			'flex items-center gap-2 px-2 text-xs font-medium tracking-wide text-muted-foreground [&>svg]:size-4 [&>svg]:shrink-0',
			'transition-[opacity,margin]',
			'group-data-[open=false]/sidebar:-mt-6 group-data-[open=false]/sidebar:opacity-0',
			className
		),
		'data-slot': 'sidebar-group-label',
		'data-sidebar': 'group-label',
		...restProps
	});

	const sidebar = getSidebarGroupCollapsibleContext();
	const isCollapsible = !!sidebar?.isCollapsible;
</script>

{#if isCollapsible}
	<CollapsibleTrigger bind:ref {...mergedProps}>
		{@render children?.()}
	</CollapsibleTrigger>
{:else if child}
	{@render child({ props: mergedProps })}
{:else}
	<div bind:this={ref} {...mergedProps}>
		{@render children?.()}
	</div>
{/if}
