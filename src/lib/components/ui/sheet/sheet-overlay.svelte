<script lang="ts">
	import { Dialog as SheetPrimitive } from 'bits-ui';
	import { fade } from 'svelte/transition';
	import { cn } from '$utils';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: SheetPrimitive.OverlayProps = $props();
</script>

<SheetPrimitive.Overlay
	forceMount
	bind:ref
	data-slot="sheet-overlay"
	class={cn('fixed inset-0 z-50 bg-black/50 blur-xl', className)}
	{...restProps}
>
	{#snippet child({ props, open })}
		{#if open}
			<div {...props} transition:fade={{ duration: 150 }}></div>
		{/if}
	{/snippet}
</SheetPrimitive.Overlay>
