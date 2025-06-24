<script lang="ts">
	import { cn } from '$lib';
	import type { HTMLAttributes } from 'svelte/elements';
	let { children, class: className, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<h5 class={cn('mt-4 text-lg', className)} {...restProps}>
	{@render children?.()}
</h5>
