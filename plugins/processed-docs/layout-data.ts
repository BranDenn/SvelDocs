import type {
	NavigationGroup,
	NavigationPage,
	NavigationTab
} from '../../src/lib/doc-navigation-context.svelte';
import docNavigationConfig from '../../src/lib/server/docs/navigation/doc-navigation.config';
import type { DocNavigationConfig } from '../../src/lib/server/docs/navigation/define-doc-navigation';
import type {
	BuiltDocRecord,
	DocLayoutData,
	DocSearchItem,
	DocsManifestData,
	ManifestDocPage
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

function toIndexedTabs(tabs: DocsManifestData['tabs']): IndexedNavigationTab[] {
	return Array.from(tabs.entries())
		.map(([id, tab]) => ({ id, ...tab }))
		.sort((a, b) => a.id - b.id);
}

function toIndexedGroups(groups: DocsManifestData['groups']): IndexedNavigationGroup[] {
	return Array.from(groups.entries())
		.map(([id, group]) => ({ id, ...group }))
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

function toSearchItem(page: ManifestDocPage): DocSearchItem {
	const doc = page.docData;

	const metadata = doc.markdown.metadata ?? {};
	const metadataDescription =
		typeof metadata.description === 'string' ? metadata.description.trim() : '';
	const content =
		typeof doc.markdown.searchContent === 'string' ? doc.markdown.searchContent.trim() : '';
	const description = [metadataDescription, content].filter(Boolean).join(' ');
	const rawKeywords = metadata.keywords;
	let keywords: string[] = [];
	if (Array.isArray(rawKeywords)) {
		keywords = rawKeywords
			.filter((item): item is string => typeof item === 'string')
			.map((item) => item.trim())
			.filter(Boolean);
	} else if (typeof rawKeywords === 'string') {
		keywords = rawKeywords
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
	}

	return {
		href: page.href,
		title: doc.title,
		description,
		...(keywords.length ? { keywords } : {}),
		...(doc.icon ? { icon: doc.icon } : {})
	};
}

function toSearchItems(pages: ManifestDocPage[]): DocSearchItem[] {
	return pages.map((page) => toSearchItem(page));
}

function createGroupedSearchGroup(
	title: string,
	pages: ManifestDocPage[],
	icon?: string
): DocSearchGroup | null {
	const items = toSearchItems(pages);
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
	pages: ManifestDocPage[],
	tabs: IndexedNavigationTab[],
	groups: IndexedNavigationGroup[]
): DocSearchGroup[] {
	const searchGroups: DocSearchGroup[] = [];

	for (const tab of tabs) {
		const tabPages = pages.filter((page) => page.tabId === tab.id);
		searchGroups.push(...createSingleTabSearchGroups(tab, tabPages, groups));
	}

	return searchGroups;
}

function createSingleTabSearchGroups(
	tab: IndexedNavigationTab,
	tabPages: ManifestDocPage[],
	groups: IndexedNavigationGroup[]
): DocSearchGroup[] {
	if (tab.mode === 'group') {
		return groups
			.filter((item) => item.tabId === tab.id)
			.map((group) =>
				createGroupedSearchGroup(
					group.title,
					tabPages.filter((page) => page.groupId === group.id),
					group.icon
				)
			)
			.filter((group): group is DocSearchGroup => Boolean(group));
	}

	const searchGroup = createGroupedSearchGroup(
		tab.title,
		tabPages.filter((page) => page.groupId === undefined),
		tab.icon
	);

	return searchGroup ? [searchGroup] : [];
}

function createStandaloneGroupSearchGroups(
	pages: ManifestDocPage[],
	groups: IndexedNavigationGroup[]
): DocSearchGroup[] {
	return groups
		.map((group) =>
			createGroupedSearchGroup(
				group.title,
				pages.filter((page) => page.groupId === group.id),
				group.icon
			)
		)
		.filter((group): group is DocSearchGroup => Boolean(group));
}

function createSearchGroups(
	pages: ManifestDocPage[],
	tabs: IndexedNavigationTab[],
	groups: IndexedNavigationGroup[]
): DocSearchGroup[] {
	if (tabs.length) {
		return createTabSearchGroups(pages, tabs, groups);
	}

	if (groups.length) {
		return createStandaloneGroupSearchGroups(pages, groups);
	}

	const items = toSearchItems(pages);
	if (!items.length) {
		return [];
	}

	return [{ title: 'Documentation', items }];
}

export function buildDocLayoutData(
	manifest: DocsManifestData,
	filter: (doc: BuiltDocRecord) => boolean = () => true
): DocLayoutData {
	const indexedTabs = toIndexedTabs(manifest.tabs);
	const indexedGroups = toIndexedGroups(manifest.groups);
	const allManifestPages = Array.from(manifest.pages.values());
	const visibleManifestPages = allManifestPages.filter((page) => filter(page.docData));
	const visiblePages: IndexedNavigationPage[] = visibleManifestPages
		.map(({ docData: _docData, filepath: _filepath, private: _private, ...page }) =>
			toNavigationPage(page)
		)
		.map((page, id) => ({ id, ...page, prev: undefined, next: undefined }));
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
	const navigationGroups = indexedGroups.filter((group) => visibleGroupIds.has(group.id));

	return {
		navigation: {
			tabs: navigationTabs,
			groups: navigationGroups,
			pages: visiblePages
		},
		searchGroups: createSearchGroups(visibleManifestPages, navigationTabs, navigationGroups)
	};
}
