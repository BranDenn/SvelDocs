import { createContext } from 'svelte';
import type { ResolvedPathname } from '$app/types';
import { page } from '$app/state';
import { SvelteMap } from 'svelte/reactivity';

export type Page = {
	href: ResolvedPathname;
	title: string;
	group?: string;
	tab?: string;
	icon?: string;
	prev?: ResolvedPathname;
	next?: ResolvedPathname;
};

export type Group = {
	title: string;
	icon?: string;
	pageHrefs: ResolvedPathname[];
};

export type Tab = {
	title: string;
	icon?: string;
	href?: ResolvedPathname;
};

export type Params = {
	tabs?: Tab[];
	groups?: Group[];
	pages?: Page[];
};

class DocNavigation {
	private readonly pagesMap = new SvelteMap<ResolvedPathname, Page>();
	private readonly tabsMap = new SvelteMap<string, Tab>();
	private readonly groupsMap = new SvelteMap<string, Group>();

	public readonly currentItem = $derived(this.pagesMap.get(page.url.pathname));

	public readonly mode = $derived.by(() => {
		if (this.currentItem?.group) return 'group';
		return 'page';
	});

	public readonly currentTab = $derived.by(() => {
		const tab = this.currentItem?.tab;
		if (!tab) return undefined;

		const tabData = this.tabsMap.get(tab);
		if (!tabData) return undefined;

		return tabData;
	});

	public readonly currentGroup = $derived.by(() => {
		const group = this.currentItem?.group;
		if (!group) return undefined;

		const groupData = this.groupsMap.get(group);
		if (!groupData) return undefined;

		return groupData;
	});

	public readonly tabs = $derived([...this.tabsMap.values()]);

	public readonly data = $derived.by(() => {
		// get all the pages on current tab
		const pagesOnTab = [...this.pagesMap.values()].flatMap((page) => {
			if (page.tab !== this.currentTab?.title) return [];
			return page;
		});

		if (this.mode === 'page') return pagesOnTab;

		const groupKeys = new Set(pagesOnTab.flatMap(({ group }) => group ?? []));

		const groupedPages = [...groupKeys].map((groupKey) => {
			const group = this.groupsMap.get(groupKey)!;
			const pages = group.pageHrefs.map((pageHref) => {
				const item = this.pagesMap.get(pageHref)!;
				return item;
			});
			return { title: group.title, icon: group.icon, pages };
		});

		return groupedPages;
	});

	constructor(params: Params) {
		params.pages?.forEach((page) => {
			const key = page.href;
			this.pagesMap.set(key, page);
		});
	}
}

const [getDocNavigationContext, set] = createContext<DocNavigation>();

export { getDocNavigationContext };

export function setDocNavigationContext(params: Params) {
	return set(new DocNavigation(params));
}
