import { error } from '@sveltejs/kit';
import docNavigationConfig from '$lib/server/navigation/doc-navigation.config';
import type {
	DocNavigationConfig,
	DocGroup,
	DocPage,
	PageItems,
	DocTab,
	DocPrivateAccess
} from '$lib/server/navigation/define-doc-navigation';
import type { DocNavigationParams } from '$lib/doc-navigation-context.svelte';

type DocModule = {
	ast?: unknown;
	metadata?: Record<string, unknown>;
	default?: {
		ast?: unknown;
		metadata?: Record<string, unknown>;
	};
};

const docModules = import.meta.glob('/content/**/*.{md,mdx}', {
	eager: true
}) as Partial<Record<string, DocModule>>;

type DocEntry = {
	slug: string;
	fileBasePath: string;
	title: string;
	tabTitle?: string;
	groupTitle?: string;
};

type ResolvedAccess = Exclude<DocPrivateAccess, false> | false;

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

/**
 * Extracts metadata from a DocModule
 */
function getModuleMetadata(module: DocModule): Record<string, unknown> {
	return module.metadata || module.default?.metadata || {};
}

/**
 * Gets the title from module metadata or a fallback based on the file path
 */
function getTitleFromModule(module: DocModule, fallbackTitle: string): string {
	const metadata = getModuleMetadata(module);
	if (metadata.title && typeof metadata.title === 'string') {
		return metadata.title;
	}
	return fallbackTitle;
}

/**
 * Finds all markdown files in a given folder and returns as DocPage objects,
 * excluding any files that are already defined in the explicitPages array.
 */
function expandLoadRest(
	folderPath: string,
	explicitPages: DocPage[],
	tab?: DocTab,
	group?: DocGroup
): DocPage[] {
	const explicitFileNames = new Set(
		explicitPages.map((page) => normalizeFileName(page).toLowerCase())
	);

	const moduleEntries = Object.entries(docModules);
	const matchingFiles = new Map<string, DocModule>();

	// Build path segments to match against
	const pathSegments = resolveFolderSegments(tab, group);

	for (const [path, module] of moduleEntries) {
		if (!module) continue;

		// Check if the path contains the folder we're looking for
		if (pathSegments.length === 0) {
			continue; // Skip if no folder segments (would match everything)
		}

		const pathCheck = pathSegments.every((segment) => path.includes(segment));
		if (!pathCheck) continue;

		// Extract the file name from the path
		const fileName =
			path
				.split('/')
				.pop()
				?.replace(/\.(md|mdx)$/, '')
				.toLowerCase() || '';

		// Skip files already explicitly defined
		if (explicitFileNames.has(fileName)) {
			continue;
		}

		// Skip index files (handled separately)
		if (fileName === 'index') {
			continue;
		}

		matchingFiles.set(fileName, module);
	}

	// Convert to DocPage objects, sorted by filename
	return Array.from(matchingFiles.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([fileName, module]) => {
			const metadata = getModuleMetadata(module);
			const title = getTitleFromModule(module, formatFileNameAsTitle(fileName));

			return {
				title,
				icon: metadata.icon as string | undefined,
				fileName: `${fileName}.md`
			};
		});
}

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

function formatFileNameAsTitle(fileName: string): string {
	return fileName
		.replaceAll(/[-_]/g, ' ') // Replace dashes and underscores with spaces
		.replace(/^./, (char) => char.toUpperCase()) // Capitalize first letter
		.replaceAll(/\s+(.)/g, (_, char) => ` ${char.toUpperCase()}`); // Capitalize after spaces
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
		tabTitle: tab?.title,
		groupTitle: group?.title
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

function expandConfiguredPages(
	pages: PageItems,
	folderPath: string,
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

	const loadedPages = expandLoadRest(folderPath, explicitPages, tab, group);
	return [...explicitPages, ...loadedPages];
}

function addGroupEntries(entries: DocEntry[], group: DocGroup, tab?: DocTab) {
	let allPages: DocPage[] = [];

	if (group.pages === 'auto') {
		// Auto-load all pages from the group folder when pages === 'auto'
		const loadedPages = expandLoadRest(group.folderPath || '', [], tab, group);
		allPages.push(...loadedPages);
	} else {
		allPages.push(...expandConfiguredPages(group.pages, group.folderPath || '', tab, group));
	}

	for (const page of allPages) {
		addEntry(entries, page, tab, group);
	}
}

function addTabEntries(entries: DocEntry[], tab: DocTab) {
	if ('groups' in tab && tab.groups && tab.groups !== 'auto') {
		for (const group of tab.groups) {
			addGroupEntries(entries, group, tab);
		}
		return;
	}

	if ('pages' in tab && tab.pages === 'auto') {
		// Auto-load all pages from the tab folder when pages === 'auto'
		const loadedPages = expandLoadRest(tab.folderPath || '', [], tab);
		for (const page of loadedPages) {
			addEntry(entries, page, tab);
		}
		return;
	}

	if ('pages' in tab && tab.pages && tab.pages !== 'auto') {
		const allPages = expandConfiguredPages(tab.pages, tab.folderPath || '', tab);
		for (const page of allPages) {
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
	const root = `/content/${fileBasePath}`;
	for (const candidate of getCandidates(root)) {
		const module = docModules[candidate];
		if (module) {
			return module;
		}
	}

	return null;
}

/**
 * Determines if a page is private based on cascading rules:
 * 1. If page.private is explicitly set, use that value
 * 2. Otherwise, if group.private is explicitly set, use that value
 * 3. Otherwise, if tab.private is explicitly set, use that value
 * 4. Otherwise, default to false (public)
 */
function resolvePageAccess(page: DocPage, group?: DocGroup, tab?: DocTab): ResolvedAccess {
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

/**
 * Finds the tab and group configs for a given entry from docNavigationConfig
 */
function findTabAndGroup(entry: DocEntry): { tab?: DocTab; group?: DocGroup } {
	if (
		!('tabs' in docNavigationConfig) ||
		!docNavigationConfig.tabs ||
		docNavigationConfig.tabs === 'auto'
	) {
		return {};
	}

	const tabs = docNavigationConfig.tabs;
	const tab = tabs.find((t) => t.title === entry.tabTitle);

	if (!tab) {
		return {};
	}

	if (!('groups' in tab) || !tab.groups || tab.groups === 'auto') {
		return { tab };
	}

	const group = tab.groups.find((g) => g.title === entry.groupTitle);
	return { tab, group };
}

/**
 * Checks if an entry is private by looking up its configuration
 * This accounts for the cascading private property:
 * 1. Check markdown file metadata first
 * 2. Then check page-level config
 * 3. Then check group-level config
 * 4. Finally check tab-level config
 */
function resolveMetadataAccess(metadata: Record<string, unknown>): ResolvedAccess | undefined {
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

function resolveEntryAccess(entry: DocEntry): ResolvedAccess {
	// First check the markdown file's metadata
	const module = findModuleByBasePath(entry.fileBasePath);
	if (module) {
		const metadata = getModuleMetadata(module);
		const metadataAccess = resolveMetadataAccess(metadata);
		if (metadataAccess !== undefined) {
			return metadataAccess;
		}
	}

	const { tab, group } = findTabAndGroup(entry);

	// Then check the tab and group
	if (group?.private !== undefined) {
		return group.private;
	}
	if (tab?.private !== undefined) {
		return tab.private;
	}
	return false;
}

const docEntries = collectDocEntries(docNavigationConfig);
const docEntriesBySlug = new Map(docEntries.map((entry) => [entry.slug, entry]));

function isAuthenticated(locals: unknown): boolean {
	if (!locals || typeof locals !== 'object') return false;
	const localObj = locals as Record<string, unknown>;
	return Boolean(localObj.user) || Boolean(localObj.emulated);
}

function addRole(roles: Set<string>, value: unknown): void {
	if (typeof value !== 'string') {
		return;
	}

	const normalized = value.trim().toLowerCase();
	if (normalized) {
		roles.add(normalized);
	}
}

function addRolesFromObject(roles: Set<string>, value: unknown): void {
	if (!value || typeof value !== 'object') {
		return;
	}

	const valueObj = value as Record<string, unknown>;
	addRole(roles, valueObj.role);

	if (!Array.isArray(valueObj.roles)) {
		return;
	}

	for (const role of valueObj.roles) {
		addRole(roles, role);
	}
}

function getUserRoles(locals: unknown): Set<string> {
	const roles = new Set<string>();

	if (!locals || typeof locals !== 'object') {
		return roles;
	}

	const localObj = locals as Record<string, unknown>;

	if (localObj.emulated) {
		roles.add('admin');
	}

	addRolesFromObject(roles, localObj);
	addRolesFromObject(roles, localObj.user);

	return roles;
}

function canAccessDoc(locals: unknown, access: DocPrivateAccess | undefined): boolean {
	if (access === undefined || access === false) {
		return true;
	}

	if (access === true) {
		return isAuthenticated(locals);
	}

	if (Array.isArray(access)) {
		const requiredRoles = normalizeRoleList(access);
		if (requiredRoles.length === 0) {
			return isAuthenticated(locals);
		}

		const roles = getUserRoles(locals);
		return requiredRoles.some((role) => roles.has(role));
	}

	if (typeof access !== 'string') {
		return isAuthenticated(locals);
	}

	const requiredRole = access.trim().toLowerCase();
	if (!requiredRole) {
		return isAuthenticated(locals);
	}

	const roles = getUserRoles(locals);
	return roles.has(requiredRole);
}

export function getPublicDocEntries() {
	return docEntries
		.filter((entry) => {
			const module = findModuleByBasePath(entry.fileBasePath);
			if (!module) return false;
			return resolveEntryAccess(entry) === false;
		})
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
	const module = findModuleByBasePath(fileBasePath);

	if (!module) {
		return false;
	}

	if (!canAccessDoc(locals, resolvePageAccess(page, group, tab))) {
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
				let pages: DocPage[] = [];

				if (group.pages === 'auto') {
					// Auto-load all pages from the group folder when pages === 'auto'
					const loadedPages = expandLoadRest(group.folderPath || '', [], tab, group);
					pages.push(...loadedPages);
				} else {
					pages.push(...expandConfiguredPages(group.pages, group.folderPath || '', tab, group));
				}

				const sidebarPages = pages
					.filter((page) => isPageAccessible(page, locals, tab, group))
					.map((page) => mapSidebarPage(page, tab, group));

				return {
					title: group.title,
					showTitle: group.showTitle !== false,
					collapsible: group.collapsible !== false,
					icon: group.icon,
					pages: sidebarPages
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

	let pages: DocPage[] = [];

	if ('pages' in tab && tab.pages === 'auto') {
		// Auto-load all pages from the tab folder when pages === 'auto'
		const loadedPages = expandLoadRest(tab.folderPath || '', [], tab);
		pages.push(...loadedPages);
	} else if ('pages' in tab && tab.pages && tab.pages !== 'auto') {
		pages.push(...expandConfiguredPages(tab.pages, tab.folderPath || '', tab));
	}

	const sidebarPages: DocSidebarPage[] = pages
		.filter((page) => isPageAccessible(page, locals, tab))
		.map((page) => mapSidebarPage(page, tab));

	return {
		title: tab.title,
		href: tabHref,
		icon: tab.icon,
		mode: 'page',
		data: sidebarPages
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

export function buildDocNavigationParams(sidebarTabs: DocSidebarTab[]): DocNavigationParams {
	const tabs: NonNullable<DocNavigationParams['tabs']> = [];
	const groups: NonNullable<DocNavigationParams['groups']> = [];
	const pages: NonNullable<DocNavigationParams['pages']> = [];

	for (const [tabIndex, tab] of sidebarTabs.entries()) {
		const tabId = `tab:${tab.href}:${tabIndex}`;
		tabs.push({
			id: tabId,
			title: tab.title,
			icon: tab.icon,
			href: tab.href,
			mode: tab.mode
		});

		if (tab.mode === 'group') {
			for (const [groupIndex, group] of (tab.data as DocSidebarGroup[]).entries()) {
				const groupId = `group:${tabId}:${normalizeSegment(group.title) || groupIndex}`;

				groups.push({
					id: groupId,
					title: group.title,
					tabId,
					icon: group.icon,
					showTitle: group.showTitle,
					collapsible: group.collapsible
				});

				for (const pageItem of group.pages) {
					pages.push({
						href: pageItem.href,
						title: pageItem.title,
						tabId,
						groupId,
						icon: pageItem.icon
					});
				}
			}
		} else {
			for (const pageItem of tab.data as DocSidebarPage[]) {
				pages.push({
					href: pageItem.href,
					title: pageItem.title,
					tabId,
					icon: pageItem.icon
				});
			}
		}
	}

	return { tabs, groups, pages };
}

export async function loadDocAst(slugParam: string) {
	const normalizedSlug = normalizeRouteSlug(slugParam);
	const docEntry = docEntriesBySlug.get(normalizedSlug);

	if (!docEntry) {
		throw error(404, 'Document not found');
	}

	const module = findModuleByBasePath(docEntry.fileBasePath);

	if (!module) {
		throw error(404, 'Document not found');
	}

	const payload =
		module.default && typeof module.default === 'object'
			? module.default
			: (module as unknown as { ast?: unknown; metadata?: Record<string, unknown> });
	const ast = payload.ast;
	const metadata = payload.metadata ?? {};

	if (!ast) {
		throw error(500, 'Document AST was not generated');
	}

	const access = resolveEntryAccess(docEntry);

	return {
		ast,
		metadata,
		slug: docEntry.slug,
		title: docEntry.title,
		access
	} as const;
}
