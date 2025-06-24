<script lang="ts">
	import { cn } from '$lib';
	import type { HTMLAttributes } from 'svelte/elements';
	let { children, class: className, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<h4 class={cn('mt-6 text-xl', className)} {...restProps}>
	{@render children?.()}
</h4>
