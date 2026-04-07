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
	import { setDocLayoutContext } from '$lib/components/docs/layout-context.svelte';

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
		const content = document.getElementById('$content');
		return content;
	}

	type DocsPageData = {
		tocEntries?: TOC.TOCSeedEntry[];
	};


	setDocNavigationContext(() => data.navigation ?? { tabs: [], groups: [], pages: [] });

	const docLayoutContext = setDocLayoutContext();

	const tocObserverRootMargin = $derived(`-${docLayoutContext.offsetTop}px 0px -50% 0px`);

	const tocObserverOptions = $derived<IntersectionObserverInit>({
		rootMargin: tocObserverRootMargin
	});

	const initialTocEntries = $derived.by(
		() => (page.data as DocsPageData | undefined)?.tocEntries ?? []
	);
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
		topOffset={docLayoutContext.offsetTop}
		observerOptions={tocObserverOptions}
		debugObserver
	>
		<Body>
			{@render children?.()}
		</Body>
	</TOC.Provider>
</SearchDialogProvider>
