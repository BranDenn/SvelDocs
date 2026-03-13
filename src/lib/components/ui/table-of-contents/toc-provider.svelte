<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { cn } from '$utils';
	import type { ClassValue } from 'clsx';
	import { onDestroy, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import TOCLabel from './toc-label.svelte';
	import TOCList from './toc-list.svelte';
	import { setTOCContext } from './toc.context.svelte';

	type Props = {
		container?: HTMLElement | null;
		highlightParents?: boolean;
		topOffset?: number;
		observerOptions?: IntersectionObserverInit;
		detectIfReachedBottom?: boolean;
		reachedBottomObserverOptions?: IntersectionObserverInit;
		children?: Snippet;
	};

	let {
		container,
		highlightParents = true,
		topOffset = 0,
		observerOptions,
		detectIfReachedBottom = true,
		reachedBottomObserverOptions = { threshold: 1 },
		children
	}: Props = $props();

	const toc = setTOCContext({
		getContainer: () => container,
		getHighlightParents: () => highlightParents,
		getTopOffset: () => topOffset,
		getObserverOptions: () => observerOptions,
		getDetectIfReachedBottom: () => detectIfReachedBottom,
		getReachedBottomObserverOptions: () => reachedBottomObserverOptions
	});

	afterNavigate(({ type }) => {
		toc.handleAfterNavigate(type);
	});

	$effect(() => {
		toc.update();
		return () => toc.destroy();
	});
</script>

{@render children?.()}
