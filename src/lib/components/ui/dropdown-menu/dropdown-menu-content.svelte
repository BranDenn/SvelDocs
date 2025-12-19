<script lang="ts">
	import { cn } from '$utils';
	import { DropdownMenuPortal } from './';
	import { DropdownMenu as DropdownMenuPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import type { ComponentProps } from 'svelte';
	import { fly } from 'svelte/transition';

	let {
		ref = $bindable(null),
		sideOffset = 8,
		portalProps,
		class: className,
		side = 'bottom',
		children,
		...restProps
	}: DropdownMenuPrimitive.ContentProps & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DropdownMenuPortal>>;
	} = $props();

	function getXY(side: DropdownMenuPrimitive.ContentProps['side'] | unknown) {
		switch (side) {
			case 'top':
				return { x: 0, y: sideOffset };
			case 'bottom':
				return { x: 0, y: -sideOffset };
			case 'left':
				return { x: sideOffset, y: 0 };
			case 'right':
				return { x: -sideOffset, y: 0 };
			default:
				return { x: 0, y: 0 };
		}
	}
</script>

<DropdownMenuPortal {...portalProps}>
	<DropdownMenuPrimitive.Content
		forceMount
		bind:ref
		data-slot="dropdown-menu-content"
		collisionPadding={8}
		{sideOffset}
		{side}
		class={cn(
			'bg-background scrollbar-thin z-50 max-h-(--bits-dropdown-menu-content-available-height) min-w-[8rem] origin-(--bits-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg border p-1 shadow-md outline-none',
			className
		)}
		{...restProps}
	>
		{#snippet child({ wrapperProps, props, open })}
			{#if open}
				<div {...wrapperProps}>
					<div {...props} transition:fly={{ duration: 150, ...getXY(props['data-side']) }}>
						{@render children?.()}
					</div>
				</div>
			{/if}
		{/snippet}
	</DropdownMenuPrimitive.Content>
</DropdownMenuPortal>
