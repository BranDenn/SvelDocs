import type { NavigationGroup, NavigationPage, NavigationTab } from '../../src/lib/doc-navigation-context.svelte';
import docNavigationConfig from '../../src/lib/server/navigation/doc-navigation.config';
import type { DocNavigationConfig } from '../../src/lib/server/navigation/define-doc-navigation';
import type {
	BuiltDocRecord,
	DocLayoutData,
	DocSearchItem,
	DocsManifestData,
	ManifestNavigationPage
} from './types';

type DocSearchGroup = DocLayoutData['searchGroups'][number];
type IndexedNavigationTab = NavigationTab & { id: number };
type IndexedNavigationGroup = NavigationGroup & { id: number };
type IndexedNavigationPage = NavigationPage & { id: number };

export function normalizeRouteSlug(slugParam: string | null | undefined): string {
	const raw = (slugParam ?? '').replaceAll(/^\/+|\/+$/g, '');
	if (!raw) return 'docs';
	return raw.startsWith('docs') ? raw : `docs/${raw}`;
}

function applyPrevNextAcrossAllPages<T extends { href: string; prev?: string; next?: string }>(
	pages: T[]
) {
	for (let i = 0; i < pages.length; i++) {
		pages[i].prev = i > 0 ? pages[i - 1]?.href : undefined;
		pages[i].next = i < pages.length - 1 ? pages[i + 1]?.href : undefined;
	}
}

function applyPrevNextWithinTabs<
	T extends { href: string; tabId?: number; prev?: string; next?: string }
>(pages: T[], pagesByTab: Map<number | string, number[]>) {
	for (const indexes of pagesByTab.values()) {
		for (let i = 0; i < indexes.length; i++) {
			const current = indexes[i];
			const prev = indexes[i - 1];
			const next = indexes[i + 1];
			const prevHref = prev === undefined ? undefined : pages[prev]?.href;
			const nextHref = next === undefined ? undefined : pages[next]?.href;
			pages[current].prev = prevHref;
			pages[current].next = nextHref;
		}
	}
}

function applyDocPrevNext<T extends { href: string; tabId?: number; prev?: string; next?: string }>(
	pages: T[]
) {
	const pagesByTab = new Map<number | string, number[]>();

	for (let index = 0; index < pages.length; index++) {
		const tabId = pages[index].tabId ?? '__default';
		const indexes = pagesByTab.get(tabId);
		if (indexes) {
			indexes.push(index);
		} else {
			pagesByTab.set(tabId, [index]);
		}
	}

	applyPrevNextWithinTabs(pages, pagesByTab);
}

function toNavigationPage(page: NavigationPage): NavigationPage {
	const pageData: NavigationPage = {
		href: page.href,
		title: page.title,
		...(page.icon ? { icon: page.icon } : {})
	};

	if (page.groupId !== undefined) {
		pageData.groupId = page.groupId;
	}

	if (page.tabId !== undefined) {
		pageData.tabId = page.tabId;
	}

	return pageData;
}

function toIndexedTabs(tabs: DocsManifestData['navigation']['tabs']): IndexedNavigationTab[] {
	return Object.entries(tabs)
		.map(([id, tab]) => ({ id: Number(id), ...tab }))
		.sort((a, b) => a.id - b.id);
}

function toIndexedGroups(groups: DocsManifestData['navigation']['groups']): IndexedNavigationGroup[] {
	return Object.entries(groups)
		.map(([id, group]) => ({ id: Number(id), ...group }))
		.sort((a, b) => a.id - b.id);
}

function filterNavigationTabs(
	pages: NavigationPage[],
	tabs: IndexedNavigationTab[]
): IndexedNavigationTab[] {
	const pageHrefsByTab = new Map<number, string[]>();

	for (const page of pages) {
		if (page.tabId === undefined) {
			continue;
		}

		const hrefs = pageHrefsByTab.get(page.tabId);
		if (hrefs) {
			hrefs.push(page.href);
		} else {
			pageHrefsByTab.set(page.tabId, [page.href]);
		}
	}

	return tabs
		.filter((tab) => pageHrefsByTab.has(tab.id))
		.map((tab) => ({
			...tab,
			href: pageHrefsByTab.get(tab.id)?.[0] ?? tab.href
		}));
}

function toSearchItem(docsBySlug: Map<string, BuiltDocRecord>, slug: string): DocSearchItem | undefined {
	return docsBySlug.get(slug)?.search;
}

function toSearchItems(docsBySlug: Map<string, BuiltDocRecord>, pages: ManifestNavigationPage[]): DocSearchItem[] {
	return pages
		.map((page) => toSearchItem(docsBySlug, page.slug))
		.filter((item): item is DocSearchItem => Boolean(item));
}

function createGroupedSearchGroup(
	docsBySlug: Map<string, BuiltDocRecord>,
	title: string,
	pages: ManifestNavigationPage[],
	icon?: string
): DocSearchGroup | null {
	const items = toSearchItems(docsBySlug, pages);
	if (!items.length) {
		return null;
	}

	return {
		title,
		...(icon ? { icon } : {}),
		items
	};
}

function createTabSearchGroups(
	docsBySlug: Map<string, BuiltDocRecord>,
	pages: ManifestNavigationPage[],
	tabs: IndexedNavigationTab[],
	groups: IndexedNavigationGroup[]
): DocSearchGroup[] {
	const searchGroups: DocSearchGroup[] = [];

	for (const tab of tabs) {
		const tabPages = pages.filter((page) => page.tabId === tab.id);
		searchGroups.push(...createSingleTabSearchGroups(docsBySlug, tab, tabPages, groups));
	}

	return searchGroups;
}

function createSingleTabSearchGroups(
	docsBySlug: Map<string, BuiltDocRecord>,
	tab: IndexedNavigationTab,
	tabPages: ManifestNavigationPage[],
	groups: IndexedNavigationGroup[]
): DocSearchGroup[] {
	if (tab.mode === 'group') {
		return groups
			.filter((item) => item.tabId === tab.id)
			.map((group) =>
				createGroupedSearchGroup(
					docsBySlug,
					group.title,
					tabPages.filter((page) => page.groupId === group.id),
					group.icon
				)
			)
			.filter((group): group is DocSearchGroup => Boolean(group));
	}

	const searchGroup = createGroupedSearchGroup(
		docsBySlug,
		tab.title,
		tabPages.filter((page) => page.groupId === undefined),
		tab.icon
	);

	return searchGroup ? [searchGroup] : [];
}

function createStandaloneGroupSearchGroups(
	docsBySlug: Map<string, BuiltDocRecord>,
	pages: ManifestNavigationPage[],
	groups: IndexedNavigationGroup[]
): DocSearchGroup[] {
	return groups
		.map((group) =>
			createGroupedSearchGroup(
				docsBySlug,
				group.title,
				pages.filter((page) => page.groupId === group.id),
				group.icon
			)
		)
		.filter((group): group is DocSearchGroup => Boolean(group));
}

function createSearchGroups(
	docsBySlug: Map<string, BuiltDocRecord>,
	pages: ManifestNavigationPage[],
	tabs: IndexedNavigationTab[],
	groups: IndexedNavigationGroup[]
): DocSearchGroup[] {
	if (tabs.length) {
		return createTabSearchGroups(docsBySlug, pages, tabs, groups);
	}

	if (groups.length) {
		return createStandaloneGroupSearchGroups(docsBySlug, pages, groups);
	}

	const items = toSearchItems(docsBySlug, pages);
	if (!items.length) {
		return [];
	}

	return [{ title: 'Documentation', items }];
}

export function buildDocLayoutData(
	manifest: DocsManifestData,
	filter: (doc: BuiltDocRecord) => boolean = () => true
): DocLayoutData {
	const docs = Array.from(manifest.getBySlug.values());
	const visibleSlugs = new Set(docs.filter(filter).map((doc) => doc.slug));
	const indexedTabs = toIndexedTabs(manifest.navigation.tabs);
	const indexedGroups = toIndexedGroups(manifest.navigation.groups);
	const allManifestPages = Object.values(manifest.navigation.pages);
	const visibleManifestPages = allManifestPages.filter((page) => visibleSlugs.has(page.slug));
	const visiblePages: IndexedNavigationPage[] = visibleManifestPages
		.map(({ slug: _slug, ...page }) => toNavigationPage(page))
		.map((page, id) => ({ id, ...page, prev: undefined, next: undefined }));

	const navigationPages = visiblePages.map(toNavigationPage);
	const config = docNavigationConfig as DocNavigationConfig;
	const tabNextPrevEnabled = 'tabs' in config && config.tabNextPrev === true;

	if (tabNextPrevEnabled) {
		applyPrevNextAcrossAllPages(visiblePages);
	} else {
		applyDocPrevNext(visiblePages);
	}

	const navigationTabs = filterNavigationTabs(visiblePages, indexedTabs);
	const visibleGroupIds = new Set(
		visiblePages
			.map((page) => page.groupId)
			.filter((groupId): groupId is number => groupId !== undefined)
	);
	const navigationGroups = indexedGroups.filter((group) =>
		visibleGroupIds.has(group.id)
	);

	return {
		navigation: {
			tabs: navigationTabs,
			groups: navigationGroups,
			pages: visiblePages
		},
		searchGroups: createSearchGroups(
			manifest.getBySlug,
			visibleManifestPages,
			navigationTabs,
			navigationGroups
		)
	};
}
