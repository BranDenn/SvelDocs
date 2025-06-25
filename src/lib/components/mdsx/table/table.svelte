<script lang="ts">
	import { cn } from '$lib';
	import type { HTMLTableAttributes } from 'svelte/elements';
	let { children, class: className, ...restProps }: HTMLTableAttributes = $props();
</script>

<div class="scrollbar overflow-auto rounded-md border shadow-xs">
	<table
		class={cn('w-full border-separate border-spacing-0 text-left text-sm', className)}
		{...restProps}
	>
		{@render children?.()}
	</table>
</div>
