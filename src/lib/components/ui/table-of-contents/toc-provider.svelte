<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import { setTOCContext, type TOCSeedEntry } from './toc-context.svelte';

	type Props = {
		container?: HTMLElement | null;
		initialEntries?: TOCSeedEntry[];
		highlightParents?: boolean;
		topOffset?: number;
		observerOptions?: IntersectionObserverInit;
		debugObserver?: boolean;
		detectIfReachedBottom?: boolean;
		reachedBottomObserverOptions?: IntersectionObserverInit;
		children?: Snippet;
		onInit?: (toc: ReturnType<typeof setTOCContext>) => void;
	};

	let {
		container,
		initialEntries = [],
		highlightParents = true,
		topOffset = 0,
		observerOptions,
		debugObserver = false,
		detectIfReachedBottom = true,
		reachedBottomObserverOptions = { threshold: 1 },
		children,
		onInit = () => {}
	}: Props = $props();

	const observerRootMargin = $derived(
		typeof observerOptions?.rootMargin === 'string' ? observerOptions.rootMargin : '0px 0px 0px 0px'
	);

	const observerBottomMargin = $derived.by(() => {
		const parts = observerRootMargin.trim().split(/\s+/);

		if (parts.length === 1) return parts[0];
		if (parts.length === 2) return parts[0];
		if (parts.length === 3) return parts[2];
		return parts[2] ?? '0px';
	});

	const toc = setTOCContext({
		getContainer: () => container,
		getHighlightParents: () => highlightParents,
		getTopOffset: () => topOffset,
		getInitialEntries: () => initialEntries,
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

	$effect.pre(() => {
		onInit(toc);
	});
</script>

{#if debugObserver}
	<div
		class="pointer-events-none fixed z-10 border border-red-500"
		style={`left: 0; right: 0; top: ${topOffset}px; bottom: calc(${observerBottomMargin} * -1)`}
	></div>
{/if}

{@render children?.()}
