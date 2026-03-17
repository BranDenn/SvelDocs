import docNavigationConfig from '$lib/server/navigation/doc-navigation.config';
import type {
	DocPrivateAccess,
	DocGroup,
	DocPage,
	DocTab,
	PageItems
} from '$lib/server/navigation/define-doc-navigation';

type RawDocModulePaths = readonly string[];

export type BaseData = {
	filepath: string;
	title: string;
	icon?: string;
	private: DocPrivateAccess | false;
};

export type DocEntry = BaseData & {
	slug: string;
};

export type DocNavigationEntry = {
	slug: string;
	title: string;
	private: DocPrivateAccess | false;
	icon?: string;
	tabTitle?: string;
	tabIcon?: string;
	groupTitle?: string;
	groupIcon?: string;
	groupShowTitle?: boolean;
	groupCollapsible?: boolean;
};

export type CollectDocEntriesResult = {
	pages: DocEntry[];
	navigation: DocNavigationEntry[];
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

function addEntry(
	pages: DocEntry[],
	navigation: DocNavigationEntry[],
	page: DocPage,
	tab?: DocTab,
	group?: DocGroup
) {
	const slug = resolveRouteSlug(page, tab, group);
	const folderSegments = resolveFolderSegments(tab, group);
	const fileName = page.fileName?.trim() ? page.fileName : `${normalizeSegment(page.title)}.md`;
	const filepath = `/content/${[...folderSegments, fileName].join('/')}`;
	const privateAccess = resolvePageAccess(page, group, tab);

	pages.push({
		slug,
		filepath,
		title: page.title,
		icon: page.icon,
		private: privateAccess
	});

	navigation.push({
		slug,
		title: page.title,
		icon: page.icon,
		private: privateAccess,
		tabTitle: tab?.title,
		tabIcon: tab?.icon,
		groupTitle: group?.title,
		groupIcon: group?.icon,
		groupShowTitle: group?.showTitle,
		groupCollapsible: group?.collapsible
	});
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
		} else {
			explicitPages.push(item);
		}
	}

	if (!hasLoadRest) {
		return explicitPages;
	}

	const loadedPages = expandLoadRest(explicitPages, rawDocModulePaths, tab, group);
	return [...explicitPages, ...loadedPages];
}

function addGroupEntries(
	pages: DocEntry[],
	navigation: DocNavigationEntry[],
	group: DocGroup,
	rawDocModulePaths: RawDocModulePaths,
	tab?: DocTab
) {
	let allPages: DocPage[] = [];

	if (group.pages === 'auto') {
		allPages.push(...expandLoadRest([], rawDocModulePaths, tab, group));
	} else {
		allPages.push(...expandConfiguredPages(group.pages, rawDocModulePaths, tab, group));
	}

	for (const page of allPages) {
		addEntry(pages, navigation, page, tab, group);
	}
}

function addTabEntries(
	pages: DocEntry[],
	navigation: DocNavigationEntry[],
	tab: DocTab,
	rawDocModulePaths: RawDocModulePaths
) {
	if ('groups' in tab && tab.groups && tab.groups !== 'auto') {
		for (const group of tab.groups) {
			addGroupEntries(pages, navigation, group, rawDocModulePaths, tab);
		}
		return;
	}

	if ('pages' in tab && tab.pages === 'auto') {
		const loadedPages = expandLoadRest([], rawDocModulePaths, tab);
		for (const page of loadedPages) {
			addEntry(pages, navigation, page, tab);
		}
		return;
	}

	if ('pages' in tab && tab.pages && tab.pages !== 'auto') {
		const allPages = expandConfiguredPages(tab.pages, rawDocModulePaths, tab);
		for (const page of allPages) {
			addEntry(pages, navigation, page, tab);
		}
	}
}

export function collectDocEntries(rawDocModulePaths: RawDocModulePaths): CollectDocEntriesResult {
	const pages: DocEntry[] = [];
	const navigation: DocNavigationEntry[] = [];
	const config = docNavigationConfig;

	if ('tabs' in config) {
		const tabs = !config.tabs || config.tabs === 'auto' ? [] : config.tabs;
		for (const tab of tabs) {
			addTabEntries(pages, navigation, tab, rawDocModulePaths);
		}
	}

	if ('groups' in config && config.groups && config.groups !== 'auto') {
		for (const group of config.groups) {
			addGroupEntries(pages, navigation, group, rawDocModulePaths);
		}
	}

	if ('pages' in config && config.pages && config.pages !== 'auto') {
		for (const page of config.pages) {
			addEntry(pages, navigation, page);
		}
	}

	return { pages, navigation };
}
