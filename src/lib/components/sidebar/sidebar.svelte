<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	interface PROPS {
		class?: ClassValue;
		children?: Snippet;
	}

	let { class: className, children }: PROPS = $props();
</script>

<aside
	class={[
		className,
		'top-[calc(var(--spacing-header)+1px)] h-[calc(100dvh-var(--spacing-header)-1px)]',
		'w-sidebar sticky overflow-y-auto p-4'
	]}
>
	{@render children?.()}
</aside>
