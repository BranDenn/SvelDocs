<script lang="ts">
	import { mergeProps, type WithElementRef } from 'bits-ui';
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Content as CollapsibleContent } from '../collapsible/index';
	import { getSidebarGroupCollapsibleContext } from './sidebar-group-collapsible-context';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLUListElement>, HTMLUListElement> = $props();

	const mergedProps = $derived({
		class: cn('flex w-full min-w-0 flex-col gap-1', className),
		'data-slot': 'sidebar-menu',
		...restProps
	});

	const sidebar = getSidebarGroupCollapsibleContext();
	const isCollapsible = !!sidebar?.isCollapsible;
</script>

{#if isCollapsible}
	<CollapsibleContent>
		{#snippet child({ props })}
			<ul bind:this={ref} {...mergeProps(mergedProps, props)}>
				{@render children?.()}
			</ul>
		{/snippet}
	</CollapsibleContent>
{:else}
	<ul bind:this={ref} {...mergedProps}>
		{@render children?.()}
	</ul>
{/if}
