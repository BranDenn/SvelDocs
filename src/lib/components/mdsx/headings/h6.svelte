<script lang="ts">
	import { cn } from '$lib';
	import type { HTMLAttributes } from 'svelte/elements';
	let { children, class: className, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<h6 class={cn('mt-2 text-base', className)} {...restProps}>
	{@render children?.()}
</h6>
