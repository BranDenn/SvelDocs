import { createContext } from 'svelte';
import { page } from '$app/state';
import { SvelteMap } from 'svelte/reactivity';

export type NavigationPage = {
	href: string;
	title: string;
	description?: string;
	groupId?: number;
	tabId?: number;
	icon?: string;
	prev?: string;
	next?: string;
};

export type NavigationGroup = {
	id: number;
	title: string;
	tabId?: number;
	icon?: string;
	showTitle?: boolean;
	collapsible?: boolean;
};

export type NavigationTab = {
	id: number;
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
	id: number;
	title: string;
	icon?: string;
	showTitle?: boolean;
	collapsible?: boolean;
	pages: NavigationPage[];
};

export type NavigationData = GroupedPages[] | NavigationPage[];

function normalizePathname(pathname: string): string {
	return pathname.length > 1 ? pathname.replaceAll(/\/+$/g, '') : pathname;
}

export class DocNavigationContext {
	private readonly pagesByHref = new SvelteMap<string, NavigationPage>();
	private readonly tabsById = new SvelteMap<number, NavigationTab>();
	private readonly groupsById = new SvelteMap<number, NavigationGroup>();
	private readonly pageOrderByTab = new SvelteMap<number, string[]>();

	public readonly currentPage = $derived.by(() => {
		return this.pagesByHref.get(page.url.pathname);
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

	public getTab(tabId: number | undefined) {
		if (tabId === undefined) return undefined;
		return this.tabsById.get(tabId);
	}

	public readonly currentTab = $derived.by(() => {
		if (this.currentPage) {
			return this.getTab(this.currentPage.tabId);
		}
		const pathSegments = normalizePathname(page.url.pathname).split('/');
		let bestTab: NavigationTab | undefined;
		let bestScore = -1;
		for (const tab of this.tabsById.values()) {
			const tabSegments = normalizePathname(tab.href).split('/');
			let i = 0;
			while (
				i < tabSegments.length &&
				i < pathSegments.length &&
				tabSegments[i] === pathSegments[i]
			)
				i++;
			if (i > bestScore) {
				bestScore = i;
				bestTab = tab;
			}
		}
		return bestTab;
	});

	public getGroup(groupId: number | undefined) {
		if (groupId === undefined) return undefined;
		return this.groupsById.get(groupId);
	}

	public readonly currentGroup = $derived.by(() => {
		return this.getGroup(this.currentPage?.groupId);
	});

	public readonly mode = $derived.by(() => {
		const tabMode = this.currentTab?.mode;
		if (tabMode) return tabMode;
		return this.groupsById.size > 0 ? 'group' : 'page';
	});

	public readonly tabs = $derived.by(() => [...this.tabsById.values()]);

	private resolveTab(tab?: NavigationTab | number) {
		if (tab === undefined) {
			return this.currentTab;
		}

		if (typeof tab === 'number') {
			return this.tabsById.get(tab);
		}

		return tab;
	}

	public getMode(tab?: NavigationTab | number) {
		const resolvedTab = this.resolveTab(tab);
		const tabMode = resolvedTab?.mode;
		if (tabMode) return tabMode;
		return this.groupsById.size > 0 ? 'group' : 'page';
	}

	public getVisiblePages(tab?: NavigationTab | number) {
		const resolvedTab = this.resolveTab(tab);

		if (!resolvedTab) {
			return [...this.pagesByHref.values()];
		}

		const hrefs = this.pageOrderByTab.get(resolvedTab.id) ?? [];
		return hrefs.flatMap((href) => this.pagesByHref.get(href) ?? []);
	}

	public getData(tab?: NavigationTab | number): NavigationData {
		const mode = this.getMode(tab);
		const visiblePages = this.getVisiblePages(tab);

		if (mode === 'page') {
			return visiblePages.filter((pageItem) => !pageItem.groupId);
		}

		const grouped = new SvelteMap<number, NavigationPage[]>();

		for (const pageItem of visiblePages) {
			if (pageItem.groupId === undefined) continue;
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
				id: groupId,
				title: group.title,
				icon: group.icon,
				showTitle: group.showTitle,
				collapsible: group.collapsible,
				pages
			});
		}

		return groupedPages;
	}

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

			if (pageItem.tabId !== undefined) {
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
