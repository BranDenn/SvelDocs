<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$utils';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLLIElement> = $props();
</script>

<li
	data-slot="step-title"
	class={cn('text-foreground flex items-center gap-3', className)}
	{...restProps}
>
	<span
		data-slot="step-index"
		aria-hidden="true"
		class="bg-secondary grid size-6 place-content-center rounded-full border text-xs font-semibold"
	></span>
	<span class="font-medium">
		{@render children?.()}
	</span>
</li>

<style>
	[data-slot='step-index']::before {
		counter-increment: step;
		content: counter(step);
	}
</style>
