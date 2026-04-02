import fs from 'node:fs';
import path from 'node:path';
import type { PluginOption } from 'vite';
import { isMarkdownModulePath, markdownToAst } from './processed-docs/markdown-to-ast';
import { collectDocEntries, type DocEntry } from './processed-docs/collect-doc-entries';
import type { DocPrivateAccess } from '../src/lib/server/docs/navigation/define-doc-navigation';
import type { BuiltDocRecord, DocsManifestData } from './processed-docs/types';

const VIRTUAL_SEARCH_JSON_ID = 'virtual:doc-search-json';
const RESOLVED_VIRTUAL_SEARCH_JSON_ID = '\0virtual:doc-search-json';

type DocSearchJsonOptions = {
	files?: string[];
};

function normalizeRootPaths(files: string[] | undefined): string[] {
	const configuredFiles = files?.length ? files : ['content'];
	return Array.from(new Set(configuredFiles.map((filePath) => path.resolve(process.cwd(), filePath))));
}

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

function buildDocRecord(
	entry: DocEntry,
	raw: string
): Promise<BuiltDocRecord> {
	return markdownToAst(raw).then((markdown) => {
		const metadata = markdown.metadata;

		return {
			slug: entry.slug,
			filepath: entry.filepath,
			title: metadata.title ? `${entry.title} (${metadata.title})` : entry.title,
			private: resolveMetadataAccess(markdown.metadata) ?? entry.private,
			icon: entry.icon ?? metadata.icon,
			markdown
		};
	});
}

async function createDocsBySlug(
	docs: DocEntry[],
	rawMarkdownByPath: Map<string, string>
): Promise<Map<string, BuiltDocRecord>> {
	const pageData = new Map<string, BuiltDocRecord>();

	for (const entry of docs) {
		const raw = rawMarkdownByPath.get(entry.filepath);
		if (raw === undefined) {
			continue;
		}

		pageData.set(entry.slug, await buildDocRecord(entry, raw));
	}

	return pageData;
}


function applyNavigationMetadata(manifest: DocsManifestData) {
	for (const page of Object.values(manifest.navigation.pages)) {
		const doc = manifest.pageData.get(page.slug);
		if (doc?.icon && !page.icon) {
			manifest.navigation.pages[page.href] = {
				...page,
				icon: doc.icon
			};
		}
	}
}

async function generateSearchData(rootPaths: string[]): Promise<DocsManifestData> {
	// get all markdown files in rootPaths
	const rawMarkdownByPath = getMarkdownRecord(rootPaths);

	
	const collectedEntries = collectDocEntries(Array.from(rawMarkdownByPath.keys()));
	const pageData = await createDocsBySlug(collectedEntries.docs, rawMarkdownByPath);
	const manifest: DocsManifestData = {
		navigation: collectedEntries.navigation,
		pageData
	};

	applyNavigationMetadata(manifest);

	return manifest;
}

export function docSearchJson(options: DocSearchJsonOptions): PluginOption {
	let searchData: DocsManifestData | null = null;
	const rootPaths = normalizeRootPaths(options.files);

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

			searchData ??= await generateSearchData(rootPaths);

			const { navigation, pageData } = searchData;
			return `export default { navigation: ${JSON.stringify(navigation)}, pageData: new Map(${JSON.stringify(Array.from(pageData.entries()))}) };`;
		},
		handleHotUpdate(ctx) {
			const absoluteFilePath = path.resolve(ctx.file);
			const isWithinConfiguredPath = rootPaths.some((rootPath) => {
				if (absoluteFilePath === rootPath) {
					return true;
				}

				return absoluteFilePath.startsWith(rootPath + path.sep);
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
