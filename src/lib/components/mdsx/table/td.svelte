<script lang="ts">
	import { cn } from '$lib';
	import type { HTMLTdAttributes } from 'svelte/elements';
	let { children, class: className, ...restProps }: HTMLTdAttributes = $props();
</script>

<td
	class={cn(
		'bg-block [&>code]:text-accent border-t p-4 leading-6 not-first:border-l',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</td>
