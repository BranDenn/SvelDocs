<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import H from './h.svelte';

	let { children, class: className, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<H element="h1" class={cn('mt-12 text-3xl sm:text-4xl', className)} {...restProps}>
	{@render children?.()}
</H>
