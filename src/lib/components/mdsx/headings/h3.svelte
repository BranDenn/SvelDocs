<script lang="ts">
	import { cn } from '$lib';
	import type { HTMLAttributes } from 'svelte/elements';
	let { children, class: className, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<h3 class={cn('mt-8 text-2xl', className)} {...restProps}>
	{@render children?.()}
</h3>
