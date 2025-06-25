<script lang="ts">
	import { cn } from '$lib';
	import type { HTMLThAttributes } from 'svelte/elements';
	let { children, class: className, ...restProps }: HTMLThAttributes = $props();
</script>

<th class={cn('bg-foreground p-4 not-first:border-l', className)} {...restProps}>
	{@render children?.()}
</th>
