import fs from 'node:fs';
import path from 'node:path';
import type { PluginOption } from 'vite';
import { isMarkdownModulePath, getMarkdownData } from './processed-docs/markdown-to-ast.js';
import { DocEntries } from './processed-docs/collect-doc-entries.js';
import type { DocPrivateAccess } from '../src/lib/server/docs/navigation/define-doc-navigation';
import type {
	BuiltDocRecord,
	DocsManifestData,
	ManifestDocPage,
	ManifestNavigationPage
} from './processed-docs/types';

const VIRTUAL_SEARCH_JSON_ID = 'virtual:doc-search-json';
const RESOLVED_VIRTUAL_SEARCH_JSON_ID = '\0virtual:doc-search-json';

type DocSearchJsonOptions = {
	files: string[];
};

function getMarkdownRecord(rootPaths: string[]): Map<string, string> {
	const map = new Map<string, string>();

	function addMarkdownFile(filePath: string) {
		if (!isMarkdownModulePath(filePath)) {
			return;
		}

		const relativePath = '/' + path.relative(process.cwd(), filePath).replaceAll('\\', '/');
		map.set(relativePath, fs.readFileSync(filePath, 'utf-8'));
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

	for (const rootPath of rootPaths) {
		walk(rootPath);
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

async function buildDocRecord(
	page: ManifestNavigationPage,
	raw: string
): Promise<BuiltDocRecord> {
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
	rawMarkdownByPath: Map<string, string>
): Promise<Map<string, ManifestDocPage>> {
	const pages = new Map<string, ManifestDocPage>();

	for (const [href, page] of navigationPages.entries()) {
		const raw = rawMarkdownByPath.get(page.filepath);
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

async function generateSearchData(rootPaths: string[]): Promise<DocsManifestData> {
	// get all markdown files in the rootPaths array
	// this is a map of [filepath, fileContent]
	const rawMarkdownByPath = getMarkdownRecord(rootPaths);

	// get doc entries from config and match with markdown files
	const docEntries = new DocEntries(Array.from(rawMarkdownByPath.keys()));

	const pages = await createPagesWithDocData(docEntries.pages, rawMarkdownByPath);

	const manifest: DocsManifestData = {
		tabs: docEntries.tabs,
		groups: docEntries.groups,
		pages
	};

	console.log(manifest)

	return manifest;
}

export function docSearchJson(options: DocSearchJsonOptions): PluginOption {
	let searchData: DocsManifestData | null = null;

	const absoluteFilePaths = options.files.map((filePath) => path.resolve(process.cwd(), filePath));

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

			searchData ??= await generateSearchData(absoluteFilePaths);

			const tabs = JSON.stringify(Array.from(searchData.tabs.entries()));
			const groups = JSON.stringify(Array.from(searchData.groups.entries()));
			const pages = JSON.stringify(Array.from(searchData.pages.entries()));
			return `export default { tabs: new Map(${tabs}), groups: new Map(${groups}), pages: new Map(${pages}) };`;
		},
		handleHotUpdate(ctx) {
			const absoluteFilePath = path.resolve(ctx.file);
			const isWithinConfiguredPath = absoluteFilePaths.some((filePath) => {
				if (absoluteFilePath === filePath) {
					return true;
				}

				return absoluteFilePath.startsWith(filePath + path.sep);
			});

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
