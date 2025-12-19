<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import H from './h.svelte';

	let { children, class: className, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<H element="h2" class={cn('mt-10 text-2xl sm:text-3xl', className)} {...restProps}>
	{@render children?.()}
</H>
