<script lang="ts">
	// import * as Sheet from '$lib/components/ui/sheet/index';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<!-- The aside is a wrapper that allows or the div to stay the same size regardless of if the scrollbar is present or not -->
<aside
	bind:this={ref}
	data-slot="sidebar"
	class={cn('scrollbar-thin sticky top-0 h-dvh shrink-0 overflow-x-hidden', className)}
	{...restProps}
>
	<div class="flex min-h-full w-64 flex-col transition-[width]">
		<div
			class="from-background pointer-events-none sticky top-0 z-10 h-4 shrink-0 bg-linear-to-b"
		></div>
		{@render children?.()}
		<div
			class="from-background pointer-events-none sticky bottom-0 z-10 h-4 shrink-0 bg-linear-to-t"
		></div>
	</div>
</aside>
