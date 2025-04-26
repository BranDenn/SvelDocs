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
		'top-0 h-[calc(100dvh-var(--spacing-header)-1px)]',
		'w-sidebar sticky overflow-hidden relative',
		className,
	)}
>	
	{@render children?.()}
</aside>
