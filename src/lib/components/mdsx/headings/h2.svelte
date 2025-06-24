<script lang="ts">
	import { cn } from '$lib';
	import type { HTMLAttributes } from 'svelte/elements';
	let { children, class: className, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<h2 class={cn('mt-10 text-3xl', className)} {...restProps}>
	{@render children?.()}
</h2>
