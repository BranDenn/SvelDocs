<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$utils';

	let {
		start = 1,
		class: className,
		style,
		children,
		...restProps
	}: HTMLAttributes<HTMLOListElement> & {
		start?: number;
	} = $props();
</script>

<ol
	data-slot="steps-root"
	class={cn('flex flex-col gap-4', className)}
	style={`counter-set: step ${start - 1};`}
	{...restProps}
>
	{@render children?.()}
</ol>
