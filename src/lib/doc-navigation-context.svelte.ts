import { createContext } from 'svelte';
import { page } from '$app/state';
import { SvelteMap } from 'svelte/reactivity';

export type NavigationPage = {
	href: string;
	title: string;
	groupId?: string;
	tabId?: string;
	icon?: string;
	prev?: string;
	next?: string;
};

export type NavigationGroup = {
	id: string;
	title: string;
	tabId?: string;
	icon?: string;
	showTitle?: boolean;
	collapsible?: boolean;
};

export type NavigationTab = {
	id: string;
	title: string;
	icon?: string;
	href: string;
	mode: 'group' | 'page';
};

export type DocNavigationParams = {
	tabs?: NavigationTab[];
	groups?: NavigationGroup[];
	pages?: NavigationPage[];
};

export type GroupedPages = {
	id: string;
	title: string;
	icon?: string;
	showTitle?: boolean;
	collapsible?: boolean;
	pages: NavigationPage[];
};

function normalizePathname(pathname: string): string {
	return pathname.length > 1 ? pathname.replaceAll(/\/+$/g, '') : pathname;
}

function resolveByHref(pathname: string, hrefMap: SvelteMap<string, NavigationPage>) {
	const normalizedPathname = normalizePathname(pathname);
	const exact = hrefMap.get(normalizedPathname);
	if (exact) return exact;

	const candidates: NavigationPage[] = [];
	for (const pageItem of hrefMap.values()) {
		if (
			normalizedPathname === pageItem.href ||
			normalizedPathname.startsWith(`${pageItem.href}/`)
		) {
			candidates.push(pageItem);
		}
	}

	if (candidates.length === 0) return undefined;
	return candidates.toSorted((a, b) => b.href.length - a.href.length)[0];
}

export class DocNavigationContext {
	private readonly pagesByHref = new SvelteMap<string, NavigationPage>();
	private readonly tabsById = new SvelteMap<string, NavigationTab>();
	private readonly groupsById = new SvelteMap<string, NavigationGroup>();
	private readonly pageOrderByTab = new SvelteMap<string, string[]>();

	public readonly currentPage = $derived.by(() => {
		return resolveByHref(page.url.pathname, this.pagesByHref);
	});

	public readonly prevPage = $derived.by(() => {
		const prevHref = this.currentPage?.prev;
		if (!prevHref) return undefined;
		return this.pagesByHref.get(prevHref);
	});

	public readonly nextPage = $derived.by(() => {
		const nextHref = this.currentPage?.next;
		if (!nextHref) return undefined;
		return this.pagesByHref.get(nextHref);
	});

	public readonly mode = $derived.by(() => {
		const tabId = this.currentPage?.tabId;
		if (!tabId) return this.currentPage?.groupId ? 'group' : 'page';
		return this.tabsById.get(tabId)?.mode ?? 'page';
	});

	public readonly currentTab = $derived.by(() => {
		const tabId = this.currentPage?.tabId;
		if (!tabId) return undefined;
		return this.tabsById.get(tabId);
	});

	public getGroup(groupId: string | undefined) {
		if (!groupId) return undefined;
		return this.groupsById.get(groupId);
	}

	public readonly currentGroup = $derived.by(() => {
		const groupId = this.currentPage?.groupId;
		if (!groupId) return undefined;
		return this.getGroup(groupId);
	});

	public readonly tabs = $derived.by(() => [...this.tabsById.values()]);

	public readonly currentTabPages = $derived.by(() => {
		const tabId = this.currentTab?.id;
		if (!tabId) {
			return [...this.pagesByHref.values()].filter((pageItem) => !pageItem.tabId);
		}

		const hrefs = this.pageOrderByTab.get(tabId) ?? [];
		return hrefs
			.map((href) => this.pagesByHref.get(href))
			.filter((pageItem): pageItem is NavigationPage => Boolean(pageItem));
	});

	public readonly data = $derived.by(() => {
		if (this.mode === 'page') {
			return this.currentTabPages.filter((pageItem) => !pageItem.groupId);
		}

		const grouped = new Map<string, NavigationPage[]>();

		for (const pageItem of this.currentTabPages) {
			if (!pageItem.groupId) continue;
			if (!grouped.has(pageItem.groupId)) {
				grouped.set(pageItem.groupId, []);
			}
			grouped.get(pageItem.groupId)?.push(pageItem);
		}

		const groupedPages: GroupedPages[] = [];
		for (const [groupId, pages] of grouped.entries()) {
			const group = this.groupsById.get(groupId);
			if (!group) continue;

			groupedPages.push({
				id: group.id,
				title: group.title,
				icon: group.icon,
				showTitle: group.showTitle,
				collapsible: group.collapsible,
				pages
			});
		}

		return groupedPages;
	});

	constructor(params: () => DocNavigationParams) {
		this.update(params());
	}

	private update(params: DocNavigationParams) {
		this.pagesByHref.clear();
		this.tabsById.clear();
		this.groupsById.clear();
		this.pageOrderByTab.clear();

		for (const tab of params.tabs ?? []) {
			this.tabsById.set(tab.id, tab);
			this.pageOrderByTab.set(tab.id, []);
		}

		for (const group of params.groups ?? []) {
			this.groupsById.set(group.id, group);
		}

		for (const pageItem of params.pages ?? []) {
			const href = normalizePathname(pageItem.href);
			this.pagesByHref.set(href, { ...pageItem, href });

			if (pageItem.tabId) {
				const tabOrder = this.pageOrderByTab.get(pageItem.tabId);
				if (tabOrder) {
					tabOrder.push(href);
				}
			}
		}
	}
}

const [getDocNavigationContext, set] = createContext<DocNavigationContext>();

export { getDocNavigationContext };

export function setDocNavigationContext(params: () => DocNavigationParams) {
	return set(new DocNavigationContext(params));
}
