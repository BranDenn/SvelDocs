<script lang="ts">
	import { cn } from '$utils';
	import type { ClassValue } from 'clsx';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTOCContext } from './toc-context.svelte';

	type Props = {
		class?: ClassValue;
		children?: Snippet;
	} & HTMLAttributes<HTMLElement>;

	let { class: className, children, ...restProps }: Props = $props();
</script>

<nav aria-label="On this page" class={cn('flex flex-col gap-4', className)} {...restProps}>
	{@render children?.()}
</nav>
