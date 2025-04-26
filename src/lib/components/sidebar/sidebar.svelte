<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { cn } from '$lib';

	interface PROPS {
		class?: ClassValue;
		children?: Snippet;
	}

	let { class: className, children }: PROPS = $props();
</script>

<aside
	class={cn(
		'h-[calc(100dvh-var(--spacing-header)-1px)] w-sidebar sticky top-[calc(var(--spacing-header)+1px)]',
		className,
	)}
>	
	{@render children?.()}
</aside>