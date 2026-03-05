import { error } from '@sveltejs/kit';
import docNavigationConfig from '$lib/server/navigation/doc-navigation';
import type {
	DocNavigationConfig,
	DocGroup,
	DocPage,
	DocTab
} from '$lib/server/navigation/define-doc-navigation';

type DocModule = {
	ast?: unknown;
	metadata?: Record<string, unknown>;
	default?: {
		ast?: unknown;
		metadata?: Record<string, unknown>;
	};
};

const publicDocModules = import.meta.glob('/src/lib/content/**/*.{md,mdx}', {
	eager: true
}) as Partial<Record<string, DocModule>>;
const privateDocModules = import.meta.glob('/src/lib/server/content/**/*.{md,mdx}', {
	eager: true
}) as Partial<Record<string, DocModule>>;

type DocEntry = {
	slug: string;
	fileBasePath: string;
	title: string;
	tabTitle?: string;
};

export type DocTabLink = {
	title: string;
	href: string;
	icon?: string;
};

export type DocSidebarPage = {
	title: string;
	href: string;
	icon?: string;
};

export type DocSidebarGroup = {
	title: string;
	showTitle: boolean;
	collapsible: boolean;
	icon?: string;
	pages: DocSidebarPage[];
};

export type DocSidebarTab = {
	title: string;
	href: string;
	icon?: string;
	mode: 'group' | 'page';
	data: DocSidebarGroup[] | DocSidebarPage[];
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

function getCandidates(basePath: string) {
	return [`${basePath}.md`, `${basePath}.mdx`, `${basePath}/index.md`, `${basePath}/index.mdx`];
}

function normalizeFileName(page: DocPage): string {
	const raw = page.fileName?.trim() ? page.fileName : `${normalizeSegment(page.title)}.md`;
	return raw.replace(/\.(md|mdx)$/i, '');
}

function resolveRouteSlug(page: DocPage, tab?: DocTab, group?: DocGroup): string {
	if (page.href) {
		const hrefSlug = normalizeRouteSlug(page.href);
		return hrefSlug;
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

function addEntry(entries: DocEntry[], page: DocPage, tab?: DocTab, group?: DocGroup) {
	const slug = resolveRouteSlug(page, tab, group);
	const folderSegments = resolveFolderSegments(tab, group);
	const fileName = normalizeFileName(page);
	const fileBasePath = [...folderSegments, fileName].join('/');

	entries.push({
		slug,
		fileBasePath,
		title: page.title,
		tabTitle: tab?.title
	});
}

function resolveFileBasePath(page: DocPage, tab?: DocTab, group?: DocGroup): string {
	const folderSegments = resolveFolderSegments(tab, group);
	const fileName = normalizeFileName(page);
	return [...folderSegments, fileName].join('/');
}

function resolveTabHref(tab: DocTab): string {
	if (tab.combineHref === false) {
		return '/docs';
	}

	return `/docs/${normalizeSegment(tab.title)}`;
}

function addGroupEntries(entries: DocEntry[], group: DocGroup, tab?: DocTab) {
	if (group.pages === 'auto') return;

	for (const page of group.pages) {
		addEntry(entries, page, tab, group);
	}
}

function addTabEntries(entries: DocEntry[], tab: DocTab) {
	if ('groups' in tab && tab.groups && tab.groups !== 'auto') {
		for (const group of tab.groups) {
			addGroupEntries(entries, group, tab);
		}
	}

	if ('pages' in tab && tab.pages && tab.pages !== 'auto') {
		for (const page of tab.pages) {
			addEntry(entries, page, tab);
		}
	}
}

function collectDocEntries(config: DocNavigationConfig): DocEntry[] {
	const entries: DocEntry[] = [];

	if ('tabs' in config) {
		const tabs = !config.tabs || config.tabs === 'auto' ? [] : config.tabs;
		for (const tab of tabs) {
			addTabEntries(entries, tab);
		}
	}

	if ('groups' in config && config.groups && config.groups !== 'auto') {
		for (const group of config.groups) {
			addGroupEntries(entries, group);
		}
	}

	if ('pages' in config && config.pages && config.pages !== 'auto') {
		for (const page of config.pages) {
			addEntry(entries, page);
		}
	}

	return entries;
}

function findModuleByBasePath(fileBasePath: string) {
	const publicRoot = `/src/lib/content/${fileBasePath}`;
	for (const candidate of getCandidates(publicRoot)) {
		const module = publicDocModules[candidate];
		if (module) {
			return { module, access: 'public' as const };
		}
	}

	const privateRoot = `/src/lib/server/content/${fileBasePath}`;
	for (const candidate of getCandidates(privateRoot)) {
		const module = privateDocModules[candidate];
		if (module) {
			return { module, access: 'private' as const };
		}
	}

	return null;
}

function findPublicModuleByBasePath(fileBasePath: string) {
	const publicRoot = `/src/lib/content/${fileBasePath}`;
	for (const candidate of getCandidates(publicRoot)) {
		const module = publicDocModules[candidate];
		if (module) {
			return module;
		}
	}

	return null;
}

const docEntries = collectDocEntries(docNavigationConfig);
const docEntriesBySlug = new Map(docEntries.map((entry) => [entry.slug, entry]));

function isAuthenticated(locals: unknown): boolean {
	if (!locals || typeof locals !== 'object') return false;
	return Boolean((locals as Record<string, unknown>).user);
}

export function getPublicDocEntries() {
	return docEntries
		.filter((entry) => findPublicModuleByBasePath(entry.fileBasePath))
		.map((entry) => ({ slug: entry.slug }));
}

export function getDocTabs(): DocTabLink[] {
	if (!('tabs' in docNavigationConfig)) {
		return [];
	}

	const tabs =
		!docNavigationConfig.tabs || docNavigationConfig.tabs === 'auto'
			? []
			: docNavigationConfig.tabs;

	return tabs.map((tab) => {
		const firstEntry = docEntries.find((entry) => entry.tabTitle === tab.title);

		return {
			title: tab.title,
			href: firstEntry ? `/${firstEntry.slug}` : resolveTabHref(tab),
			icon: tab.icon
		};
	});
}

function isPageAccessible(page: DocPage, locals: unknown, tab?: DocTab, group?: DocGroup): boolean {
	const fileBasePath = resolveFileBasePath(page, tab, group);
	const match = findModuleByBasePath(fileBasePath);

	if (!match) {
		return false;
	}

	if (match.access === 'private' && !isAuthenticated(locals)) {
		return false;
	}

	return true;
}

function mapSidebarPage(page: DocPage, tab?: DocTab, group?: DocGroup): DocSidebarPage {
	return {
		title: page.title,
		href: `/${resolveRouteSlug(page, tab, group)}`,
		icon: page.icon
	};
}

function buildSidebarTab(tab: DocTab, locals: unknown): DocSidebarTab {
	const tabHref =
		getDocTabs().find((item) => item.title === tab.title)?.href ?? resolveTabHref(tab);

	if ('groups' in tab && tab.groups && tab.groups !== 'auto') {
		const groups: DocSidebarGroup[] = tab.groups
			.map((group) => {
				const pages =
					group.pages === 'auto'
						? []
						: group.pages
								.filter((page) => isPageAccessible(page, locals, tab, group))
								.map((page) => mapSidebarPage(page, tab, group));

				return {
					title: group.title,
					showTitle: group.showTitle !== false,
					collapsible: group.collapsible !== false,
					icon: group.icon,
					pages
				};
			})
			.filter((group) => group.pages.length > 0);

		return {
			title: tab.title,
			href: tabHref,
			icon: tab.icon,
			mode: 'group',
			data: groups
		};
	}

	const pages: DocSidebarPage[] =
		'pages' in tab && tab.pages && tab.pages !== 'auto'
			? tab.pages
					.filter((page) => isPageAccessible(page, locals, tab))
					.map((page) => mapSidebarPage(page, tab))
			: [];

	return {
		title: tab.title,
		href: tabHref,
		icon: tab.icon,
		mode: 'page',
		data: pages
	};
}

export function getDocSidebarTabs(locals: unknown): DocSidebarTab[] {
	if (!('tabs' in docNavigationConfig)) {
		return [];
	}

	const tabs =
		!docNavigationConfig.tabs || docNavigationConfig.tabs === 'auto'
			? []
			: docNavigationConfig.tabs;

	return tabs
		.map((tab) => buildSidebarTab(tab, locals))
		.filter((tab) =>
			tab.mode === 'group'
				? (tab.data as DocSidebarGroup[]).length > 0
				: (tab.data as DocSidebarPage[]).length > 0
		);
}

export async function loadDocAst(slugParam: string, locals: unknown) {
	const normalizedSlug = normalizeRouteSlug(slugParam);
	const docEntry = docEntriesBySlug.get(normalizedSlug);

	if (!docEntry) {
		throw error(404, 'Document not found');
	}

	const match = findModuleByBasePath(docEntry.fileBasePath);

	if (!match) {
		throw error(404, 'Document not found');
	}

	if (match.access === 'private' && !isAuthenticated(locals)) {
		throw error(401, 'Unauthorized');
	}

	const module = match.module;
	const payload =
		module.default && typeof module.default === 'object'
			? module.default
			: (module as unknown as { ast?: unknown; metadata?: Record<string, unknown> });
	const ast = payload.ast;
	const metadata = payload.metadata ?? {};

	if (!ast) {
		throw error(500, 'Document AST was not generated');
	}

	return {
		ast,
		metadata,
		slug: docEntry.slug,
		title: docEntry.title,
		access: match.access
	};
}
