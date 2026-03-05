<script lang="ts">
	import { cn } from '$utils';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
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
			'group/sidebar-group-label flex items-center gap-2 px-2 text-xs font-medium tracking-wide text-muted-foreground [&>svg]:size-3.5 [&>svg]:shrink-0',
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
		<ChevronDown
			class="ml-auto text-muted-foreground transition-[rotate] group-data-[state=closed]/sidebar-group-label:-rotate-90"
		/>
	</CollapsibleTrigger>
{:else if child}
	{@render child({ props: mergedProps })}
{:else}
	<div bind:this={ref} {...mergedProps}>
		{@render children?.()}
	</div>
{/if}
