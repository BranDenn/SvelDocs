<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$utils';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	data-slot="step-body"
	class={cn('text-muted-foreground ml-3 border-l pl-6', className)}
	{...restProps}
>
	{@render children?.()}
</div>
