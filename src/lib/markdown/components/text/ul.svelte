<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { children, class: className, ...restProps }: HTMLAttributes<HTMLUListElement> = $props();
</script>

<ul class={cn('text-muted-foreground list-disc space-y-4 pl-8', className)} {...restProps}>
	{@render children?.()}
</ul>
