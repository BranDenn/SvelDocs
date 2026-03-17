import config from '../../src/lib/server/navigation/doc-navigation.config';
import type { DocsNavigationMaps } from './types';
import type {
	DocPrivateAccess,
	DocGroup,
	DocPage,
	DocTab,
	PageItems
} from '../../src/lib/server/navigation/define-doc-navigation';

type RawDocModulePaths = readonly string[];

type CollectorContext = {
	docs: DocEntry[];
	navigation: DocsNavigationMaps;
	nextTabId: number;
	nextGroupId: number;
};

export type BaseData = {
	filepath: string;
	title: string;
	icon?: string;
	private: DocPrivateAccess | false;
};

export type DocEntry = BaseData & {
	slug: string;
};

export type CollectDocEntriesResult = {
	docs: DocEntry[];
	navigation: DocsNavigationMaps;
};

function normalizeSegment(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replaceAll(/[^a-z0-9\s-]/g, '')
		.replaceAll(/\s+/g, '-')
		.replaceAll(/-+/g, '-');
}

function trimSlashes(value: string | null | undefined): string {
	return (value ?? '').replaceAll(/^\/+|\/+$/g, '');
}

function normalizeRouteSlug(slugParam: string | null | undefined): string {
	const trimmed = trimSlashes(slugParam);
	if (!trimmed) return 'docs';
	return trimmed.startsWith('docs') ? trimmed : `docs/${trimmed}`;
}

function normalizeFileName(page: DocPage): string {
	const raw = page.fileName?.trim() ? page.fileName : `${normalizeSegment(page.title)}.md`;
	return raw.replace(/\.(md|mdx)$/i, '');
}

function resolveRouteSlug(page: DocPage, tab?: DocTab, group?: DocGroup): string {
	if (page.href) {
		return normalizeRouteSlug(page.href);
	}

	const parts: string[] = ['docs'];

	if (tab && tab.combineHref !== false) {
		parts.push(normalizeSegment(tab.title));
	}

	if (group && group.combineHref !== false) {
		parts.push(normalizeSegment(group.title));
	}

	parts.push(normalizeSegment(page.title));
	return parts.join('/');
}

function resolveFolderSegments(tab?: DocTab, group?: DocGroup): string[] {
	const segments: string[] = [];

	if (tab) {
		segments.push(trimSlashes(tab.folderPath ?? normalizeSegment(tab.title)));
	}

	if (group) {
		segments.push(trimSlashes(group.folderPath ?? normalizeSegment(group.title)));
	}

	return segments.filter(Boolean);
}

function formatFileNameAsTitle(fileName: string): string {
	return fileName
		.replaceAll(/[-_]/g, ' ')
		.replace(/^./, (char) => char.toUpperCase())
		.replaceAll(/\s+(.)/g, (_, char) => ` ${char.toUpperCase()}`);
}

function resolvePageAccess(
	page: DocPage,
	group?: DocGroup,
	tab?: DocTab
): DocPrivateAccess | false {
	if (page.private !== undefined) {
		return page.private;
	}

	if (group?.private !== undefined) {
		return group.private;
	}

	if (tab?.private !== undefined) {
		return tab.private;
	}

	return false;
}

function createCollectorContext(): CollectorContext {
	return {
		docs: [],
		navigation: {
			tabs: {},
			groups: {},
			pages: {}
		},
		nextTabId: 0,
		nextGroupId: 0
	};
}

function createTab(ctx: CollectorContext, tab: DocTab): number {
	const tabId = ctx.nextTabId++;
	ctx.navigation.tabs[tabId] = {
		title: tab.title,
		href: '',
		mode: 'page',
		...(tab.icon ? { icon: tab.icon } : {})
	};

	return tabId;
}

function createGroup(ctx: CollectorContext, group: DocGroup, tabId?: number): number {
	const groupId = ctx.nextGroupId++;
	const groupData: DocsNavigationMaps['groups'][number] = {
		title: group.title,
		showTitle: group.showTitle ?? true,
		collapsible: group.collapsible ?? true,
		...(group.icon ? { icon: group.icon } : {})
	};
	if (tabId !== undefined) {
		groupData.tabId = tabId;
	}
	ctx.navigation.groups[groupId] = groupData;
	if (tabId !== undefined) {
		const tab = ctx.navigation.tabs[tabId];
		if (tab) {
			tab.mode = 'group';
		}
	}

	return groupId;
}

function addEntry(
	ctx: CollectorContext,
	page: DocPage,
	options: { tab?: DocTab; group?: DocGroup; tabId?: number; groupId?: number } = {}
) {
	const { tab, group, tabId, groupId } = options;
	const slug = resolveRouteSlug(page, tab, group);
	const folderSegments = resolveFolderSegments(tab, group);
	const fileName = page.fileName?.trim() ? page.fileName : `${normalizeSegment(page.title)}.md`;
	const filepath = `/content/${[...folderSegments, fileName].join('/')}`;
	const privateAccess = resolvePageAccess(page, group, tab);
	const href = `/${slug}`;

	if (tabId !== undefined) {
		const tabData = ctx.navigation.tabs[tabId];
		if (tabData?.href === '') {
			tabData.href = href;
		}
	}

	ctx.docs.push({
		slug,
		filepath,
		title: page.title,
		icon: page.icon,
		private: privateAccess
	});

	const pageData: DocsNavigationMaps['pages'][string] = {
		slug,
		href,
		title: page.title,
		...(page.icon ? { icon: page.icon } : {})
	};
	if (tabId !== undefined) {
		pageData.tabId = tabId;
	}
	if (groupId !== undefined) {
		pageData.groupId = groupId;
	}
	ctx.navigation.pages[href] = pageData;
}

function expandLoadRest(
	explicitPages: DocPage[],
	rawDocModulePaths: RawDocModulePaths,
	tab?: DocTab,
	group?: DocGroup
): DocPage[] {
	const explicitFileNames = new Set(
		explicitPages.map((page) => normalizeFileName(page).split('/').pop()?.toLowerCase() ?? '')
	);

	const matchingFiles = new Map<string, string>();
	const pathSegments = resolveFolderSegments(tab, group);

	if (pathSegments.length === 0) {
		return [];
	}

	for (const filePath of rawDocModulePaths) {
		const pathCheck = pathSegments.every((segment) => filePath.includes(segment));
		if (!pathCheck) continue;

		const fullFileName = filePath.split('/').pop() ?? '';
		const strippedName = fullFileName.replace(/\.(md|mdx)$/i, '').toLowerCase();

		if (explicitFileNames.has(strippedName) || strippedName === 'index') {
			continue;
		}

		matchingFiles.set(strippedName, fullFileName);
	}

	return Array.from(matchingFiles.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(
			([strippedName, fullFileName]) =>
				({
					title: formatFileNameAsTitle(strippedName),
					fileName: fullFileName
				}) satisfies DocPage
		);
}

function expandConfiguredPages(
	pages: PageItems,
	rawDocModulePaths: RawDocModulePaths,
	tab?: DocTab,
	group?: DocGroup
): DocPage[] {
	const explicitPages: DocPage[] = [];
	let hasLoadRest = false;

	for (const item of pages) {
		if (item === 'loadRest') {
			hasLoadRest = true;
			continue;
		}

		explicitPages.push(item);
	}

	if (!hasLoadRest) {
		return explicitPages;
	}

	return [...explicitPages, ...expandLoadRest(explicitPages, rawDocModulePaths, tab, group)];
}

function getPagesForGroup(
	group: DocGroup,
	rawDocModulePaths: RawDocModulePaths,
	tab?: DocTab
): DocPage[] {
	if (group.pages === 'auto') {
		return expandLoadRest([], rawDocModulePaths, tab, group);
	}

	return expandConfiguredPages(group.pages, rawDocModulePaths, tab, group);
}

function getPagesForTab(tab: DocTab, rawDocModulePaths: RawDocModulePaths): DocPage[] {
	if ('pages' in tab && tab.pages === 'auto') {
		return expandLoadRest([], rawDocModulePaths, tab);
	}

	if ('pages' in tab && tab.pages && tab.pages !== 'auto') {
		return expandConfiguredPages(tab.pages, rawDocModulePaths, tab);
	}

	return [];
}

function addGroupEntries(
	ctx: CollectorContext,
	group: DocGroup,
	rawDocModulePaths: RawDocModulePaths,
	tabId?: number,
	tab?: DocTab
) {
	const pages = getPagesForGroup(group, rawDocModulePaths, tab);
	if (pages.length === 0) {
		return;
	}

	const groupId = createGroup(ctx, group, tabId);

	for (const page of pages) {
		addEntry(ctx, page, { tab, group, tabId, groupId });
	}
}

function addTabEntries(ctx: CollectorContext, tab: DocTab, rawDocModulePaths: RawDocModulePaths) {
	const tabId = createTab(ctx, tab);

	if ('groups' in tab && tab.groups && tab.groups !== 'auto') {
		for (const group of tab.groups) {
			addGroupEntries(ctx, group, rawDocModulePaths, tabId, tab);
		}
		return;
	}

	for (const page of getPagesForTab(tab, rawDocModulePaths)) {
		addEntry(ctx, page, { tab, tabId });
	}
}

function collectTabs(ctx: CollectorContext, rawDocModulePaths: RawDocModulePaths) {
	if (!('tabs' in config)) {
		return;
	}

	const tabs = !config.tabs || config.tabs === 'auto' ? [] : config.tabs;
	for (const tab of tabs) {
		addTabEntries(ctx, tab, rawDocModulePaths);
	}
}

function collectGroups(ctx: CollectorContext, rawDocModulePaths: RawDocModulePaths) {
	if (!('groups' in config) || !config.groups || config.groups === 'auto') {
		return;
	}

	for (const group of config.groups) {
		addGroupEntries(ctx, group, rawDocModulePaths);
	}
}

function collectRootPages(ctx: CollectorContext) {
	if (!('pages' in config) || !config.pages || config.pages === 'auto') {
		return;
	}

	for (const page of config.pages) {
		addEntry(ctx, page, {});
	}
}

export function collectDocEntries(rawDocModulePaths: RawDocModulePaths): CollectDocEntriesResult {
	const ctx = createCollectorContext();

	collectTabs(ctx, rawDocModulePaths);
	collectGroups(ctx, rawDocModulePaths);
	collectRootPages(ctx);

	return {
		docs: ctx.docs,
		navigation: ctx.navigation
	};
}
