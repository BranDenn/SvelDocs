<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';
	import { cn } from '$utils';

	interface PROPS {
		class?: ClassValue;
		children?: Snippet;
		props?: HTMLAttributes<HTMLDivElement>;
	}

	let { class: className, children, ...props }: PROPS = $props();
</script>

<aside
	{...props}
	class={cn('top-desktop-header sticky h-[calc(100dvh-var(--spacing-desktop-header))]', className)}
>
	{@render children?.()}
</aside>
