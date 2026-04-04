import fs from 'node:fs';
import path from 'node:path';
import type { PluginOption } from 'vite';
import { getMarkdownData } from './processed-docs/markdown-to-ast.js';
import { DocEntries } from './processed-docs/collect-doc-entries.js';
import markdownConfig from '../src/lib/markdown/configuration/markdown.config.js';
import { toPosixPath } from './processed-docs/utils.js';
import type { DocPrivateAccess } from '../src/lib/docs/server/navigation/define-doc-navigation.js';
import type {
	BuiltDocRecord,
	DocsManifestData,
	ManifestDocPage,
	ManifestNavigationPage
} from './processed-docs/types';

const VIRTUAL_SEARCH_JSON_ID = 'virtual:doc-search-json';
const RESOLVED_VIRTUAL_SEARCH_JSON_ID = '\0virtual:doc-search-json';

type DocSearchJsonOptions = {
	markdownFolderPath: string;
};

const MARKDOWN_EXTENSIONS = new Set(
	(markdownConfig.extensions ?? []).map((extension) => extension.toLowerCase())
);

export function isMarkdownModulePath(filePath: string): boolean {
	return MARKDOWN_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function getMarkdownRecord(rootPath: string): Record<string, string> {
	const map = new Map<string, string>();

	function addMarkdownFile(filePath: string) {
		if (!isMarkdownModulePath(filePath)) {
			return;
		}

		const fileContent = fs.readFileSync(filePath, 'utf-8');
		map.set(toPosixPath(filePath), fileContent);
	}

	function walk(filePath: string) {
		if (!fs.existsSync(filePath)) return;

		const stat = fs.statSync(filePath);
		if (stat.isFile()) {
			addMarkdownFile(filePath);
			return;
		}

		const entries = fs.readdirSync(filePath, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(filePath, entry.name);
			if (entry.isDirectory()) {
				walk(fullPath);
			} else {
				addMarkdownFile(fullPath);
			}
		}
	}

	walk(rootPath);

	return Object.fromEntries(map);
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

async function buildDocRecord(page: ManifestNavigationPage, raw: string): Promise<BuiltDocRecord> {
	const markdown = await getMarkdownData(raw);
	const metadata = markdown.metadata;

	return {
		slug: page.slug,
		href: page.href,
		filepath: page.filepath,
		title: metadata.title ? `${page.title} (${metadata.title})` : page.title,
		private: resolveMetadataAccess(markdown.metadata) ?? page.private,
		icon: page.icon ?? metadata.icon,
		markdown
	};
}

async function createPagesWithDocData(
	navigationPages: Map<string, ManifestNavigationPage>,
	rawMarkdownByPath: Record<string, string>
): Promise<Map<string, ManifestDocPage>> {
	const pages = new Map<string, ManifestDocPage>();

	for (const [href, page] of navigationPages.entries()) {
		const raw = rawMarkdownByPath[toPosixPath(page.filepath)];

		if (raw === undefined) continue;
		const docData = await buildDocRecord(page, raw);

		pages.set(href, {
			...page,
			icon: page.icon ?? docData.icon,
			docData
		});
	}

	return pages;
}

async function generateSearchData(markdownFolderPath: string): Promise<DocsManifestData> {
	const normalizedMarkdownFolderPath = toPosixPath(markdownFolderPath);

	// get all markdown files in the configured markdown folder
	// this is a map of { filepath: fileContent }
	const rawMarkdownByPath = getMarkdownRecord(markdownFolderPath);

	// get doc entries from config and match with markdown files
	const docEntries = new DocEntries(rawMarkdownByPath, normalizedMarkdownFolderPath);

	const pages = await createPagesWithDocData(docEntries.pages, rawMarkdownByPath);

	const manifest: DocsManifestData = {
		tabs: docEntries.tabs,
		groups: docEntries.groups,
		pages
	};

	return manifest;
}

export function docSearchJson(options: DocSearchJsonOptions): PluginOption {
	let searchData: DocsManifestData | null = null;

	const absoluteMarkdownFolderPath = toPosixPath(
		path.resolve(process.cwd(), options.markdownFolderPath)
	);

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

			searchData ??= await generateSearchData(absoluteMarkdownFolderPath);

			const tabs = JSON.stringify(Array.from(searchData.tabs.entries()));
			const groups = JSON.stringify(Array.from(searchData.groups.entries()));
			const pages = JSON.stringify(Array.from(searchData.pages.entries()));
			return `export default { tabs: new Map(${tabs}), groups: new Map(${groups}), pages: new Map(${pages}) };`;
		},
		handleHotUpdate(ctx) {
			const absoluteFilePath = toPosixPath(path.resolve(ctx.file));
			const isWithinConfiguredPath =
				absoluteFilePath === absoluteMarkdownFolderPath ||
				absoluteFilePath.startsWith(absoluteMarkdownFolderPath + '/');

			const isContentFile = isWithinConfiguredPath && isMarkdownModulePath(absoluteFilePath);

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
