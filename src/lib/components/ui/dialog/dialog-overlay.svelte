<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { fade } from 'svelte/transition';
	import { cn } from '$utils';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DialogPrimitive.OverlayProps = $props();
</script>

<DialogPrimitive.Overlay
	forceMount
	bind:ref
	data-slot="dialog-overlay"
	class={cn('fixed inset-0 z-50 bg-black/50 blur-xl', className)}
	{...restProps}
>
	{#snippet child({ props, open })}
		{#if open}
			<div {...props} transition:fade={{ duration: 150 }}></div>
		{/if}
	{/snippet}
</DialogPrimitive.Overlay>
