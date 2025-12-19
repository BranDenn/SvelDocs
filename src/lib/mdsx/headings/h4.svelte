<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import H from './h.svelte';

	let { children, class: className, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<H element="h4" class={cn('mt-6 text-lg sm:text-xl', className)} {...restProps}>
	{@render children?.()}
</H>
