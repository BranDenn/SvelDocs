<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import H from './h.svelte';
	let { children, class: className, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<H element="h5" class={cn('mt-4 text-base sm:text-lg', className)} {...restProps}>
	{@render children?.()}
</H>
