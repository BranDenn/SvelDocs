import fs from 'node:fs';
import path from 'node:path';
import type { PluginOption } from 'vite';
import { isMarkdownModulePath, markdownToAst } from './processed-docs/markdown-to-ast';
import { collectDocEntries } from './processed-docs/collect-doc-entries';
import docNavigationConfig from '../src/lib/server/docs/navigation/doc-navigation.config';
import type {
	DocPrivateAccess,
	DocNavigationConfig
} from '../src/lib/server/docs/navigation/define-doc-navigation';
import type {
	BuiltDocRecord,
	DocsManifestData,
	ManifestNavigationPage
} from './processed-docs/types';

const VIRTUAL_SEARCH_JSON_ID = 'virtual:doc-search-json';
const RESOLVED_VIRTUAL_SEARCH_JSON_ID = '\0virtual:doc-search-json';

function getMarkdownRecord(): Map<string, string> {
	const map = new Map<string, string>();
	const contentDir = path.resolve(process.cwd(), 'content');

	function walk(dir: string) {
		if (!fs.existsSync(dir)) return;

		const entries = fs.readdirSync(dir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				walk(fullPath);
			} else if (isMarkdownModulePath(entry.name)) {
				const relativePath =
					'/content/' +
					path.relative(path.join(process.cwd(), 'content'), fullPath).replaceAll('\\', '/');
				map.set(relativePath, fs.readFileSync(fullPath, 'utf-8'));
			}
		}
	}

	walk(contentDir);
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
			pages[current].prev = prev === undefined ? undefined : pages[prev]?.href;
			pages[current].next = next === undefined ? undefined : pages[next]?.href;
		}
	}
}

function applyDocPrevNext<T extends { href: string; tabId?: number; prev?: string; next?: string }>(
	pages: T[]
) {
	const config = docNavigationConfig as DocNavigationConfig;
	const tabNextPrevEnabled = 'tabs' in config && config.tabNextPrev === true;

	if (tabNextPrevEnabled) {
		applyPrevNextAcrossAllPages(pages);
		return;
	}

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

function getOrderedNavigationPages(manifest: DocsManifestData): ManifestNavigationPage[] {
	return Object.values(manifest.navigation.pages);
}

function buildDocRecord(
	entry: {
		slug: string;
		filepath: string;
		title: string;
		icon?: string;
		private: DocPrivateAccess | false;
	},
	raw: string
): Promise<BuiltDocRecord> {
	return markdownToAst(raw).then((markdown) => {
		const metadata = markdown.metadata ?? {};
		const metadataDescription =
			typeof metadata.description === 'string' ? metadata.description.trim() : '';
		const content = typeof markdown.content === 'string' ? markdown.content.trim() : '';
		const description = [metadataDescription, content].filter(Boolean).join(' ');
		const keywords = normalizeSearchKeywords(metadata.keywords);
		const metadataIcon = typeof metadata.icon === 'string' ? metadata.icon : undefined;
		const icon = entry.icon ?? metadataIcon;
		const metadataAccess = resolveMetadataAccess(markdown.metadata);
		const privateAccess = metadataAccess ?? entry.private;
		const metadataTitle = typeof metadata.title === 'string' ? metadata.title.trim() : '';
		const hasDistinctMetadataTitle =
			metadataTitle.length > 0 && metadataTitle.toLowerCase() !== entry.title.toLowerCase();
		const title = hasDistinctMetadataTitle ? `${entry.title} (${metadataTitle})` : entry.title;

		return {
			slug: entry.slug,
			filepath: entry.filepath,
			title,
			private: privateAccess,
			markdown,
			search: {
				href: `/${entry.slug}`,
				title,
				description,
				...(keywords.length ? { keywords } : {}),
				...(icon ? { icon } : {})
			}
		};
	});
}

async function createDocsBySlug(
	docs: ReturnType<typeof collectDocEntries>['docs'],
	rawMarkdownByPath: Map<string, string>
): Promise<Map<string, BuiltDocRecord>> {
	const docsBySlug = new Map<string, BuiltDocRecord>();

	for (const entry of docs) {
		const raw = rawMarkdownByPath.get(entry.filepath);
		if (raw === undefined) {
			continue;
		}

		docsBySlug.set(entry.slug, await buildDocRecord(entry, raw));
	}

	return docsBySlug;
}

function applyNavigationMetadata(manifest: DocsManifestData) {
	const pages = getOrderedNavigationPages(manifest);
	applyDocPrevNext(pages);

	for (const page of pages) {
		const doc = manifest.getBySlug.get(page.slug);
		if (doc?.search.icon && !page.icon) {
			page.icon = doc.search.icon;
		}

		manifest.navigation.pages[page.href] = page;
	}
}

async function generateSearchData(): Promise<DocsManifestData> {
	const rawMarkdownByPath = getMarkdownRecord();
	const collectedEntries = collectDocEntries(Array.from(rawMarkdownByPath.keys()));
	const getBySlug = await createDocsBySlug(collectedEntries.docs, rawMarkdownByPath);
	const manifest: DocsManifestData = {
		navigation: collectedEntries.navigation,
		getBySlug
	};

	applyNavigationMetadata(manifest);

	return manifest;
}

export function docSearchJson(): PluginOption {
	let searchData: DocsManifestData | null = null;

	return {
		name: 'vite-plugin-doc-search-json',
		resolveId(id) {
			if (id === VIRTUAL_SEARCH_JSON_ID) {
				return RESOLVED_VIRTUAL_SEARCH_JSON_ID;
			}
		},
		async load(id) {
			if (id !== RESOLVED_VIRTUAL_SEARCH_JSON_ID) {
				return null;
			}

			searchData ??= await generateSearchData();

			const { navigation, getBySlug } = searchData;
			return `export default { navigation: ${JSON.stringify(navigation)}, getBySlug: new Map(${JSON.stringify(Array.from(getBySlug.entries()))}) };`;
		},
		handleHotUpdate(ctx) {
			const absoluteFilePath = path.resolve(ctx.file);
			const contentPath = path.resolve(process.cwd(), 'content');

			const isContentFile =
				absoluteFilePath.startsWith(contentPath + path.sep) &&
				/\.(md|mdx)$/i.test(absoluteFilePath);

			if (!isContentFile) {
				return;
			}

			// Invalidate cached search data on content change
			searchData = null;

			const virtualModule = ctx.server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_SEARCH_JSON_ID);
			if (virtualModule) {
				ctx.server.moduleGraph.invalidateModule(virtualModule);
			}
		}
	};
}
