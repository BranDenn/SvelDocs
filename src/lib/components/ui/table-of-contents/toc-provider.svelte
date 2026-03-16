<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import { setTOCContext } from './toc-context.svelte';

	type Props = {
		container?: HTMLElement | null;
		highlightParents?: boolean;
		topOffset?: number;
		observerOptions?: IntersectionObserverInit;
		detectIfReachedBottom?: boolean;
		reachedBottomObserverOptions?: IntersectionObserverInit;
		children?: Snippet;
		onInit?: (toc: ReturnType<typeof setTOCContext>) => void;
	};

	let {
		container,
		highlightParents = true,
		topOffset = 0,
		observerOptions,
		detectIfReachedBottom = true,
		reachedBottomObserverOptions = { threshold: 1 },
		children,
		onInit = () => {}
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

	$effect.pre(() => {
		onInit(toc);
	});
</script>

{@render children?.()}
