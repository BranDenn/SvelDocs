<script lang="ts">
	import { Dialog as SheetPrimitive } from 'bits-ui';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import * as Sheet from './';
	import { type WithoutChildrenOrChild } from 'bits-ui';
	import { cn } from '$utils';
	import { fly } from 'svelte/transition';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		side = 'left',
		hideClose = false,
		...restProps
	}: WithoutChildrenOrChild<SheetPrimitive.ContentProps> & {
		portalProps?: SheetPrimitive.PortalProps;
		children?: Snippet;
		side?: 'left' | 'right' | 'top' | 'bottom';
		hideClose?: boolean;
	} = $props();

	function getXY(side: 'left' | 'right' | 'top' | 'bottom') {
		switch (side) {
			case 'top':
				return { x: 0, y: '-100%' };
			case 'bottom':
				return { x: 0, y: '100%' };
			case 'left':
				return { x: '-100%', y: 0 };
			case 'right':
				return { x: '100%', y: 0 };
			default:
				return { x: 0, y: 0 };
		}
	}
</script>

<Sheet.Portal {...portalProps}>
	<Sheet.Overlay />
	<SheetPrimitive.Content
		forceMount
		bind:ref
		data-slot="sheet-content"
		class={cn(
			'bg-background fixed z-50',
			side === 'left' && 'top-0 bottom-0 left-0 w-full max-w-92 border-r',
			side === 'right' && 'top-0 right-0 bottom-0 w-full max-w-92 border-l',
			side === 'top' && 'top-0 right-0 left-0 h-full max-h-64 border-b',
			side === 'bottom' && 'right-0 bottom-0 left-0 h-full max-h-64 border-t',
			className
		)}
		{...restProps}
	>
		{#snippet child({ props, open })}
			{#if open}
				<div {...props} transition:fly={{ duration: 300, ...getXY(side) }}>
					{@render children?.()}
					{#if !hideClose}
						<Sheet.Close
							class="ring-offset-background focus:ring-ring absolute end-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
						>
							<XIcon class="size-5 shrink-0" />
						</Sheet.Close>
					{/if}
				</div>
			{/if}
		{/snippet}
	</SheetPrimitive.Content>
</Sheet.Portal>
