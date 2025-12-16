<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import * as Dialog from './';
	import { type WithoutChildrenOrChild } from 'bits-ui';
	import { cn } from '$utils';
	import { fly } from 'svelte/transition';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		hideClose = false,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		portalProps?: DialogPrimitive.PortalProps;
		children: Snippet;
		hideClose?: boolean;
	} = $props();
</script>

<Dialog.Portal {...portalProps}>
	<Dialog.Overlay />
	<DialogPrimitive.Content
		forceMount
		bind:ref
		data-slot="dialog-content"
		class={cn(
			'flex flex-col gap-4',
			'w-full max-w-[calc(100%-2rem)] transition-[max-width,max-height,top] sm:max-w-lg',
			'max-h-[min(32rem,calc(100%-2rem))]',
			'scroll-thin bg-background fixed top-1/2 left-1/2 z-50 -translate-1/2 overflow-auto rounded-lg border p-4 shadow-lg',
			className
		)}
		{...restProps}
	>
		{#snippet child({ props, open })}
			{#if open}
				<div {...props} transition:fly={{ duration: 150, y: -64 }}>
					{@render children?.()}
					{#if !hideClose}
						<Dialog.Close
							class="ring-offset-background focus:ring-ring absolute end-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
						>
							<XIcon class="size-5 shrink-0" />
						</Dialog.Close>
					{/if}
				</div>
			{/if}
		{/snippet}
	</DialogPrimitive.Content>
</Dialog.Portal>
