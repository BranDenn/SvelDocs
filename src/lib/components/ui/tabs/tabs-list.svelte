<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$utils';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: TabsPrimitive.ListProps = $props();
</script>

<TabsPrimitive.List
	bind:ref
	data-slot="tabs-list"
	class={cn(
		'relative inline-flex w-fit items-center justify-center overflow-hidden',
		className
	)}
	{...restProps}
>
	<div
		aria-hidden="true"
		data-slot="tabs-list-indicator"
		class="pointer-events-none absolute hidden rounded-md border border-transparent bg-background shadow-sm"
	></div>
	{@render children?.()}
</TabsPrimitive.List>

<style>
	@supports (anchor-name: --active-tab) and (position-anchor: --active-tab) {
		:global([data-slot='tabs-list'] [data-slot='tabs-list-indicator']) {
			position-anchor: --active-tab;
			top: anchor(top);
			left: anchor(left);
			width: anchor-size(width);
			height: anchor-size(height);
			display: block;
			transition: top, left, width, height;
			transition-duration: 150ms;
			transition-timing-function: ease-out;
		}
	}
</style>