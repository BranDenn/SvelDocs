import { createContext, type Component } from 'svelte';
import type { ResolvedPathname } from '$app/types';
import { page } from '$app/state';
import { SvelteMap } from 'svelte/reactivity';

export type DocNavItem = {
	title: string;
	group?: string;
	tab?: string;
	icon?: string | Component;
	prev?: ResolvedPathname;
	next?: ResolvedPathname;
};

type Tab = {
	icon?: string | Component;
	href: ResolvedPathname;
};

type Group = {
	icon?: string | Component;
	pageHrefs: ResolvedPathname[];
};

export class DocNavigation {
	private readonly pagesMap = new SvelteMap<ResolvedPathname, DocNavItem>();
	private readonly tabsMap = new SvelteMap<string, Tab>();
	private readonly groupsMap = new SvelteMap<string, Group>();

	public currentItem = $derived(this.pagesMap.get(page.url.pathname));

	public currentTab = $derived.by(() => {
		const tab = this.currentItem?.tab;
		if (!tab) return undefined;

		const tabData = this.tabsMap.get(tab);
		if (!tabData) return undefined;

		return { title: tab, ...tabData };
	});

	public currentGroup = $derived.by(() => {
		const group = this.currentItem?.group;
		if (!group) return undefined;

		const groupData = this.groupsMap.get(group);
		if (!groupData) return undefined;

		return { title: group, ...groupData };
	});

	public tabs = $derived.by(() => {
		const titles = [...this.tabsMap.keys()];
		const merged = titles.map((title) => {
			return { title, ...this.tabsMap.get(title)! };
		});
		return merged;
	});

	public groups = $derived.by(() => {
		const titles = [...this.groupsMap.keys()];
		const merged = titles.map((title) => {
			const group = { title, ...this.groupsMap.get(title)! };
			const pages = group.pageHrefs.map((href) => {
				const item = this.pagesMap.get(href)!;
				return { href, title: item.title, icon: item.icon };
			});
			return { title: group.title, icon: group.icon, pages };
		});
		return merged;
	});
}

export const [getDocNavigationContext, setDocNavigationContext] = createContext<DocNavigation>();
