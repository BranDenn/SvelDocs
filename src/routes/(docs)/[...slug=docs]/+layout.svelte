<script lang="ts">
	import './docs.css';
	import { Header, Body } from '$components/docs';
	import {
		setDocNavigationContext,
		type DocNavigationParams
	} from '$lib/doc-navigation-context.svelte';
	import type { Snippet } from 'svelte';
	import type { Pathname } from '$app/types';
	import * as TOC from '$ui/table-of-contents';
	import { SearchDialogProvider, Search } from '$ui/search-dialog';
	import { untrack } from 'svelte';

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
			emulated?: boolean;
		};
		children?: Snippet;
	} = $props();

	function getContentContainer() {
		if (typeof document === 'undefined') return null;
		return document.getElementById('$content') as HTMLElement | null;
	}

	setDocNavigationContext(() => data.navigation ?? { tabs: [], groups: [], pages: [] });

	let searchContext: Search | null = $state.raw(null);

	$effect(() => {
		if (searchContext) {
			searchContext.clearSearch();

			for (const group of data.searchGroups ?? []) {
				searchContext.addGroup({
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

			untrack(() => searchContext?.signalUpdate());
		}
	});
</script>

<SearchDialogProvider onInit={(search) => (searchContext = search)}>
	<Header />

	<TOC.Provider container={getContentContainer()}>
		<Body>
			{@render children?.()}
		</Body>
	</TOC.Provider>
</SearchDialogProvider>
