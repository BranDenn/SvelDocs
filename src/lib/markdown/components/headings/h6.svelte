<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import H from './h.svelte';

	let { children, class: className, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<H element="h6" class={cn('mt-2 text-sm sm:text-base', className)} {...restProps}>
	{@render children?.()}
</H>
