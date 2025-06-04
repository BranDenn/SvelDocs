<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib';

	interface PROPS {
		class?: ClassValue;
		children?: Snippet;
		props?: HTMLAttributes<HTMLDivElement>;
	}

	let { class: className, children, ...props }: PROPS = $props();
</script>

<aside
	{...props}
	class={cn(
		'h-[calc(100dvh-var(--spacing-header)-1px)] sticky top-[calc(var(--spacing-header)+1px)]',
		className,
	)}
>	
	{@render children?.()}
</aside>