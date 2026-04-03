<script lang="ts">
	import './docs.css';
	import { Header, Body } from '$components/docs';
	import { dev } from '$app/environment';
	import {
		setDocNavigationContext,
		type DocNavigationParams
	} from '$lib/docs/client/doc-navigation-context.svelte';
	import { createSharedValueContext } from '$ui/shared-value-context.svelte';
	import { onMount, type Snippet } from 'svelte';
	import type { Pathname } from '$app/types';
	import * as TOC from '$ui/table-of-contents';
	import { SearchDialogProvider } from '$ui/search-dialog';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';

	let {
		data,
		children
	}: {
		data: {
			navigation?: DocNavigationParams;
			searchGroups?: {
				title: string;
				icon?: string;
				items: {
					href: string;
					title: string;
					description: string;
					keywords?: string[];
					icon?: string;
				}[];
			}[];
		};
		children?: Snippet;
	} = $props();

	// Create shared context for tabs and code groups
	createSharedValueContext({
		id: 'js-pkg-managers',
		initialValue: 'bun',
		useLocalStorage: true
	});

	function getContentContainer() {
		if (typeof document === 'undefined') return null;
		return document.getElementById('$content') as HTMLElement | null;
	}

	function resolveCssLength(value: string, scope: HTMLElement) {
		const trimmedValue = value.trim();
		if (!trimmedValue) return 0;

		if (/^-?\d*\.?\d+px$/.test(trimmedValue)) {
			const parsed = Number.parseFloat(trimmedValue);
			return Number.isFinite(parsed) ? parsed : 0;
		}

		const measurement = scope.ownerDocument.createElement('div');
		measurement.style.position = 'absolute';
		measurement.style.visibility = 'hidden';
		measurement.style.pointerEvents = 'none';
		measurement.style.inlineSize = trimmedValue;
		measurement.style.blockSize = '0';
		measurement.style.padding = '0';
		measurement.style.border = '0';
		measurement.style.overflow = 'hidden';

		scope.appendChild(measurement);
		const resolvedValue = Number.parseFloat(getComputedStyle(measurement).inlineSize);
		measurement.remove();

		return Number.isFinite(resolvedValue) ? resolvedValue : 0;
	}

	function readDocsContentHeaderOffset() {
		if (typeof window === 'undefined') return 0;

		const contentContainer = getContentContainer();
		if (!contentContainer) return 0;

		const styles = getComputedStyle(contentContainer);
		const docsHeader = resolveCssLength(
			styles.getPropertyValue('--spacing-docs-header'),
			contentContainer
		);

		const contentHeader = resolveCssLength(
			styles.getPropertyValue('--spacing-docs-content-header'),
			contentContainer
		);

		return docsHeader + contentHeader;
	}

	type DocsBreakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';
	type DocsPageData = {
		tocEntries?: TOC.TOCSeedEntry[];
	};

	const tailwindBreakpointFallbacks = {
		sm: 640,
		md: 768,
		lg: 1024,
		xl: 1280
	} as const;

	function readTailwindBreakpoints() {
		if (typeof document === 'undefined') {
			return tailwindBreakpointFallbacks;
		}

		const root = document.documentElement;
		const rootStyles = getComputedStyle(root);

		return {
			sm:
				resolveCssLength(rootStyles.getPropertyValue('--breakpoint-sm'), root) ||
				tailwindBreakpointFallbacks.sm,
			md:
				resolveCssLength(rootStyles.getPropertyValue('--breakpoint-md'), root) ||
				tailwindBreakpointFallbacks.md,
			lg:
				resolveCssLength(rootStyles.getPropertyValue('--breakpoint-lg'), root) ||
				tailwindBreakpointFallbacks.lg,
			xl:
				resolveCssLength(rootStyles.getPropertyValue('--breakpoint-xl'), root) ||
				tailwindBreakpointFallbacks.xl
		};
	}

	function resolveDocsBreakpoint(
		width: number,
		breakpoints: ReturnType<typeof readTailwindBreakpoints>
	): DocsBreakpoint {
		if (width >= breakpoints.xl) return 'xl';
		if (width >= breakpoints.lg) return 'lg';
		if (width >= breakpoints.md) return 'md';
		if (width >= breakpoints.sm) return 'sm';

		return 'base';
	}

	setDocNavigationContext(() => data.navigation ?? { tabs: [], groups: [], pages: [] });

	const tocObserverBottomMargin = '-50%';

	let tocTopOffset = $state(0);

	function syncOffsets() {
		tocTopOffset = readDocsContentHeaderOffset();
	}

	const tocObserverRootMargin = $derived(`-${tocTopOffset}px 0px ${tocObserverBottomMargin} 0px`);

	const tocObserverOptions = $derived<IntersectionObserverInit>({
		rootMargin: tocObserverRootMargin
	});

	const initialTocEntries = $derived.by(
		() => (page.data as DocsPageData | undefined)?.tocEntries ?? []
	);

	afterNavigate(() => {
		syncOffsets();
	});

	onMount(() => {
		syncOffsets();

		const contentContainer = getContentContainer();
		const docsContainer = contentContainer?.closest('[data-docs-toc]') ?? document.body;
		const root = document.documentElement;
		const breakpoints = readTailwindBreakpoints();
		let currentBreakpoint = resolveDocsBreakpoint(window.innerWidth, breakpoints);

		const resizeObserver = new ResizeObserver(() => {
			const nextBreakpoint = resolveDocsBreakpoint(window.innerWidth, breakpoints);

			if (nextBreakpoint === currentBreakpoint) return;

			currentBreakpoint = nextBreakpoint;
			syncOffsets();
		});

		resizeObserver.observe(root);

		const docsMutationObserver = new MutationObserver(() => syncOffsets());
		docsMutationObserver.observe(docsContainer, {
			attributes: true,
			attributeFilter: ['data-docs-toc', 'data-docs-tabs', 'class', 'style']
		});

		return () => {
			resizeObserver.disconnect();
			docsMutationObserver.disconnect();
		};
	});
</script>

<SearchDialogProvider
	onInit={(search) => {
		search.clearSearch();

		for (const group of data.searchGroups ?? []) {
			search.addGroup({
				title: group.title,
				icon: group.icon,
				items: group.items.map((item) => ({
					href: item.href as Pathname,
					title: item.title,
					description: item.description,
					keywords: item.keywords,
					icon: item.icon
				}))
			});
		}

		search.signalUpdate();
	}}
>
	<Header />

	<TOC.Provider
		container={getContentContainer()}
		initialEntries={initialTocEntries}
		topOffset={tocTopOffset}
		observerOptions={tocObserverOptions}
	>
		<Body>
			{@render children?.()}
		</Body>
	</TOC.Provider>
</SearchDialogProvider>
