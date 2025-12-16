<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import H from './h.svelte';
	let { children, class: className, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<H element="h3" class={cn('mt-8 text-xl sm:text-2xl', className)} {...restProps}>
	{@render children?.()}
</H>
