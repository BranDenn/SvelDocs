import { error } from '@sveltejs/kit';
import type {
	DocNavigationConfig,
	DocPrivateAccess
} from '$lib/server/navigation/define-doc-navigation';
import docNavigationConfig from '$lib/server/navigation/doc-navigation.config';
import type {
	DocNavigationParams,
	NavigationGroup,
	NavigationPage,
	NavigationTab
} from '$lib/doc-navigation-context.svelte';
import { collectDocEntries, type DocEntry, type DocNavigationEntry } from './docs-entries';
import { isMarkdownModulePath, markdownToAst, type MarkdownAstResult } from './docs-ast-conversion';

export type DocData = DocEntry & {
	slug: string;
	markdown: MarkdownAstResult;
};

export type DocSearchItem = {
	href: string;
	title: string;
	description: string;
	keywords?: string[];
	icon?: string;
};

export type DocSearchGroup = {
	title: string;
	icon?: string;
	items: DocSearchItem[];
};

export type NavigationPageWithAccess = NavigationPage & {
	private: DocPrivateAccess | false;
	search: DocSearchItem;
};

export type BaseDocNavigation = {
	tabs: NavigationTab[];
	groups: NavigationGroup[];
	pages: NavigationPageWithAccess[];
};

export type DocLayoutData = {
	navigation: DocNavigationParams;
	searchGroups: DocSearchGroup[];
};

function getMarkdownRecord() {
	const map = new Map<string, string>();

	const rawDocModules: Record<string, string> = import.meta.glob('/content/**/*', {
		eager: true,
		query: '?raw',
		import: 'default'
	});

	for (const [path, raw] of Object.entries(rawDocModules)) {
		if (isMarkdownModulePath(path)) {
			map.set(path, raw);
		}
	}

	return map;
}

function normalizeRoleList(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}

	const normalizedRoles = value
		.filter((role): role is string => typeof role === 'string')
		.map((role) => role.trim().toLowerCase())
		.filter(Boolean);

	return Array.from(new Set(normalizedRoles));
}

function normalizeSearchKeywords(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value
			.filter((item): item is string => typeof item === 'string')
			.map((item) => item.trim())
			.filter(Boolean);
	}

	if (typeof value === 'string') {
		return value
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
	}

	return [];
}

function resolveMetadataAccess(metadata: Record<string, unknown>): DocPrivateAccess | undefined {
	if (metadata.private === undefined) {
		return undefined;
	}

	if (Array.isArray(metadata.private)) {
		const roles = normalizeRoleList(metadata.private);
		return roles.length > 0 ? roles : false;
	}

	if (typeof metadata.private === 'string') {
		const role = metadata.private.trim();
		return role || false;
	}

	return Boolean(metadata.private);
}

export function normalizeRouteSlug(slugParam: string | null | undefined): string {
	const raw = (slugParam ?? '').replaceAll(/^\/+|\/+$/g, '');
	if (!raw) return 'docs';
	return raw.startsWith('docs') ? raw : `docs/${raw}`;
}

function resolveTabIcon(tabTitle: string): string | undefined {
	const config = docNavigationConfig as DocNavigationConfig;
	if (!('tabs' in config) || !config.tabs || config.tabs === 'auto') {
		return undefined;
	}

	const match = config.tabs.find((tab) => tab.title === tabTitle);
	return match?.icon;
}

function toSearchItem(entry: DocNavigationEntry, doc: DocData | undefined): DocSearchItem {
	const metadata = doc?.markdown.metadata ?? {};
	const metadataDescription =
		typeof metadata.description === 'string' ? metadata.description.trim() : '';
	const content = typeof doc?.markdown.content === 'string' ? doc.markdown.content.trim() : '';
	const description = [metadataDescription, content].filter(Boolean).join(' ');
	const keywords = normalizeSearchKeywords(metadata.keywords);
	const metadataIcon = typeof metadata.icon === 'string' ? metadata.icon : undefined;
	const icon = entry.icon ?? metadataIcon;
	const metadataTitle = typeof metadata.title === 'string' ? metadata.title.trim() : '';
	const hasDistinctMetadataTitle =
		metadataTitle.length > 0 && metadataTitle.toLowerCase() !== entry.title.toLowerCase();
	const title = hasDistinctMetadataTitle ? `${entry.title} (${metadataTitle})` : entry.title;

	return {
		href: `/${entry.slug}`,
		title,
		description,
		...(keywords.length ? { keywords } : {}),
		...(icon ? { icon } : {})
	};
}

type BuildState = {
	pages: NavigationPageWithAccess[];
	tabs: NavigationTab[];
	groups: NavigationGroup[];
	tabIdByTitle: Map<string, string>;
	groupIdByKey: Map<string, string>;
	pagesByTab: Map<string, number[]>;
	hasGroupsByTab: Map<string, boolean>;
};

function createBuildState(): BuildState {
	return {
		pages: [],
		tabs: [],
		groups: [],
		tabIdByTitle: new Map<string, string>(),
		groupIdByKey: new Map<string, string>(),
		pagesByTab: new Map<string, number[]>(),
		hasGroupsByTab: new Map<string, boolean>()
	};
}

function ensureTabId(state: BuildState, entry: DocNavigationEntry): string | undefined {
	if (!entry.tabTitle) {
		return undefined;
	}

	const existing = state.tabIdByTitle.get(entry.tabTitle);
	if (existing) {
		return existing;
	}

	const tabId = `tab:${state.tabs.length}`;
	state.tabIdByTitle.set(entry.tabTitle, tabId);

	const icon = entry.tabIcon ?? resolveTabIcon(entry.tabTitle);
	state.tabs.push({
		id: tabId,
		title: entry.tabTitle,
		href: `/${entry.slug}`,
		mode: 'page',
		...(icon ? { icon } : {})
	});

	return tabId;
}

function ensureGroupId(
	state: BuildState,
	entry: DocNavigationEntry,
	tabId: string | undefined
): string | undefined {
	if (!entry.groupTitle) {
		return undefined;
	}

	const groupKey = `${tabId ?? 'root'}::${entry.groupTitle}`;
	const existing = state.groupIdByKey.get(groupKey);
	if (existing) {
		if (tabId) {
			state.hasGroupsByTab.set(tabId, true);
		}
		return existing;
	}

	const groupId = `group:${state.groups.length}`;
	state.groupIdByKey.set(groupKey, groupId);
	state.groups.push({
		id: groupId,
		title: entry.groupTitle,
		showTitle: entry.groupShowTitle ?? true,
		collapsible: entry.groupCollapsible ?? true,
		...(entry.groupIcon ? { icon: entry.groupIcon } : {}),
		...(tabId ? { tabId } : {})
	});

	if (tabId) {
		state.hasGroupsByTab.set(tabId, true);
	}

	return groupId;
}

function pushPage(
	state: BuildState,
	entry: DocNavigationEntry,
	doc: DocData | undefined,
	tabId: string | undefined,
	groupId: string | undefined
) {
	const metadata = doc?.markdown.metadata ?? {};
	const metadataIcon = typeof metadata.icon === 'string' ? metadata.icon : undefined;
	const icon = entry.icon ?? metadataIcon;
	const privateAccess = doc?.private ?? entry.private;

	state.pages.push({
		href: `/${entry.slug}`,
		title: entry.title,
		private: privateAccess,
		search: toSearchItem(entry, doc),
		...(icon ? { icon } : {}),
		...(tabId ? { tabId } : {}),
		...(groupId ? { groupId } : {})
	});

	if (!tabId) {
		return;
	}

	const pageIndex = state.pages.length - 1;
	const existingIndexes = state.pagesByTab.get(tabId);
	if (existingIndexes) {
		existingIndexes.push(pageIndex);
		return;
	}

	state.pagesByTab.set(tabId, [pageIndex]);
}

function applyTabModes(state: BuildState) {
	for (const tab of state.tabs) {
		tab.mode = state.hasGroupsByTab.get(tab.id) ? 'group' : 'page';
	}
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
	T extends { href: string; tabId?: string; prev?: string; next?: string }
>(pages: T[], pagesByTab: Map<string, number[]>) {
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

function applyDocPrevNext<T extends { href: string; tabId?: string; prev?: string; next?: string }>(
	pages: T[]
) {
	const config = docNavigationConfig as DocNavigationConfig;
	const tabNextPrevEnabled = 'tabs' in config && config.tabNextPrev === true;

	if (tabNextPrevEnabled) {
		applyPrevNextAcrossAllPages(pages);
		return;
	}

	const pagesByTab = new Map<string, number[]>();

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

function buildBaseNavigation(
	entries: DocNavigationEntry[],
	docsBySlug: Map<string, DocData>
): BaseDocNavigation {
	const state = createBuildState();

	for (const entry of entries) {
		const tabId = ensureTabId(state, entry);
		const groupId = ensureGroupId(state, entry, tabId);
		const doc = docsBySlug.get(entry.slug);
		pushPage(state, entry, doc, tabId, groupId);
	}

	applyTabModes(state);
	applyDocPrevNext(state.pages);

	return { tabs: state.tabs, groups: state.groups, pages: state.pages };
}

const rawMarkdownByPath = getMarkdownRecord();
const collectedEntries = collectDocEntries(Array.from(rawMarkdownByPath.keys()));
const docEntries = collectedEntries.pages;
const docNavigationEntries = collectedEntries.navigation;

async function createDocsData(entries: DocEntry[]) {
	const docsBySlug = new Map<string, DocData>();
	const docs: DocData[] = [];

	for (const entry of entries) {
		const raw = rawMarkdownByPath.get(entry.filepath);
		if (raw === undefined) continue;

		const markdown = await markdownToAst(raw);
		const metadataAccess = resolveMetadataAccess(markdown.metadata);
		const title = entry.title;

		const doc: DocData = {
			...entry,
			slug: entry.slug,
			title,
			private: metadataAccess ?? entry.private,
			markdown
		};

		docsBySlug.set(entry.slug, doc);
		docs.push(doc);
	}

	return { docsBySlug, docs };
}

const docsData = await createDocsData(docEntries);

export const docsBySlug = docsData.docsBySlug;
export const docs = docsData.docs;
export const docsNavigationBase = buildBaseNavigation(docNavigationEntries, docsBySlug);

function toNavigationPage(page: NavigationPageWithAccess): NavigationPage {
	return {
		href: page.href,
		title: page.title,
		...(page.groupId ? { groupId: page.groupId } : {}),
		...(page.tabId ? { tabId: page.tabId } : {}),
		...(page.icon ? { icon: page.icon } : {})
	};
}

function filterNavigationTabs(pages: NavigationPage[], tabs: NavigationTab[]): NavigationTab[] {
	const pageHrefsByTab = new Map<string, string[]>();

	for (const page of pages) {
		if (!page.tabId) {
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

function createSearchGroups(
	pages: NavigationPageWithAccess[],
	tabs: NavigationTab[],
	groups: NavigationGroup[]
): DocSearchGroup[] {
	if (tabs.length) {
		const searchGroups: DocSearchGroup[] = [];

		for (const tab of tabs) {
			const tabPages = pages.filter((page) => page.tabId === tab.id);

			if (tab.mode === 'group') {
				for (const group of groups.filter((item) => item.tabId === tab.id)) {
					const items = tabPages
						.filter((page) => page.groupId === group.id)
						.map((page) => page.search);

					if (!items.length) {
						continue;
					}

					searchGroups.push({
						title: group.title,
						...(group.icon ? { icon: group.icon } : {}),
						items
					});
				}

				continue;
			}

			const items = tabPages.filter((page) => !page.groupId).map((page) => page.search);
			if (!items.length) {
				continue;
			}

			searchGroups.push({
				title: tab.title,
				...(tab.icon ? { icon: tab.icon } : {}),
				items
			});
		}

		return searchGroups;
	}

	if (groups.length) {
		return groups
			.map((group) => ({
				title: group.title,
				...(group.icon ? { icon: group.icon } : {}),
				items: pages.filter((page) => page.groupId === group.id).map((page) => page.search)
			}))
			.filter((group) => group.items.length > 0);
	}

	if (!pages.length) {
		return [];
	}

	return [
		{
			title: 'Documentation',
			items: pages.map((page) => page.search)
		}
	];
}

export function getDocLayoutData(filter: (doc: DocData) => boolean = () => true): DocLayoutData {
	const visibleSlugs = new Set(docs.filter(filter).map((doc) => doc.slug));
	const visiblePages = docsNavigationBase.pages
		.filter((page) => visibleSlugs.has(normalizeRouteSlug(page.href)))
		.map((page) => ({ ...page, prev: undefined, next: undefined }));

	const navigationPages = visiblePages.map(toNavigationPage);
	applyDocPrevNext(navigationPages);

	const navigationTabs = filterNavigationTabs(navigationPages, docsNavigationBase.tabs);
	const visibleGroupIds = new Set(navigationPages.map((page) => page.groupId).filter(Boolean));
	const navigationGroups = docsNavigationBase.groups.filter((group) =>
		visibleGroupIds.has(group.id)
	);

	return {
		navigation: {
			tabs: navigationTabs,
			groups: navigationGroups,
			pages: navigationPages
		},
		searchGroups: createSearchGroups(visiblePages, navigationTabs, navigationGroups)
	};
}

export function getPublicDocEntries() {
	return docs.filter((doc) => doc.private === false).map((doc) => ({ slug: doc.slug }));
}

export function getDocsData(slugParam: string): DocData {
	const slug = normalizeRouteSlug(slugParam);
	const data = docsBySlug.get(slug);

	if (!data) {
		throw error(404, 'Document not found');
	}

	return data;
}

export function toDocPayload(doc: DocData) {
	const ast = doc.markdown.ast;
	if (!ast) {
		throw error(500, 'Document AST was not generated');
	}

	return {
		ast,
		metadata: doc.markdown.metadata ?? {},
		slug: doc.slug,
		title: doc.title,
		access: doc.private
	} as const;
}
