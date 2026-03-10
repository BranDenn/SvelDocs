import matter from 'gray-matter';
import type { PluginOption } from 'vite';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkRehype, { type Options as RemarkRehypeOptions } from 'remark-rehype';
import type { MarkdownConfig } from '../src/lib/markdown/define-config';

type RehypeNode = { type: string; children?: RehypeNode[]; [key: string]: unknown };
type MdastNode = { type?: string; value?: string; children?: MdastNode[]; [key: string]: unknown };

const MDX_PASS_THROUGH = ['mdxJsxFlowElement', 'mdxJsxTextElement'];

function hasScriptTagNodes(root: MdastNode): boolean {
	function visit(node: MdastNode): boolean {
		if (
			(node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
			node.name === 'script'
		) {
			return true;
		}
		return (node.children ?? []).some(visit);
	}
	return visit(root);
}

type MdxComponentAliasMap = Record<string, string[]>;
type MdxComponentImportMap = Record<string, string>;

function getImportSourceBaseName(source: string): string {
	const normalized = source.replaceAll('\\', '/');
	const filename = normalized.split('/').pop() ?? normalized;
	return filename.replace(/\.(svelte|ts|js|mjs|cjs)$/i, '');
}

function toPascalCase(value: string): string {
	return value
		.replaceAll(/[-_]+/g, ' ')
		.split(' ')
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');
}

function addAlias(map: MdxComponentAliasMap, key: string, candidates: string[]) {
	if (!key.trim()) return;
	const uniqueCandidates = Array.from(new Set(candidates.filter(Boolean)));
	if (!uniqueCandidates.length) return;
	const previous = map[key] ?? [];
	map[key] = Array.from(new Set([...previous, ...uniqueCandidates]));
}

const RE_DEFAULT_IMPORT = /^import\s+([\w$]+)\s+from\s+['"]([^'"]+)['"]/;
const RE_NAMED_IMPORT = /^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/;

function applyDefaultImport(
	aliases: MdxComponentAliasMap,
	imports: MdxComponentImportMap,
	localName: string,
	source: string
) {
	const baseName = getImportSourceBaseName(source);
	addAlias(aliases, localName, [
		localName,
		'default',
		baseName,
		baseName.toLowerCase(),
		toPascalCase(baseName)
	]);
	imports[localName] = source;
}

function applyNamedImports(
	aliases: MdxComponentAliasMap,
	imports: MdxComponentImportMap,
	specifierBlock: string,
	source: string
) {
	const baseName = getImportSourceBaseName(source);
	for (const specifier of specifierBlock.split(',')) {
		const parts = specifier.trim().split(/\s+as\s+/);
		const importedName = parts[0].trim();
		const localName = (parts[1] ?? parts[0]).trim();
		if (!localName) continue;
		addAlias(aliases, localName, [
			localName,
			importedName,
			baseName,
			baseName.toLowerCase(),
			toPascalCase(baseName)
		]);
		imports[localName] = source;
	}
}

function extractImportData(rawContent: string): {
	aliases: MdxComponentAliasMap;
	imports: MdxComponentImportMap;
} {
	const aliases: MdxComponentAliasMap = {};
	const imports: MdxComponentImportMap = {};
	const lines = rawContent.split('\n');
	let inCodeFence = false;

	for (const line of lines) {
		const trimmed = line.trim();
		if (/^(`{3,}|~{3,})/.test(trimmed)) {
			inCodeFence = !inCodeFence;
			continue;
		}
		if (inCodeFence || !/^import\s/.test(trimmed)) continue;

		const defaultMatch = RE_DEFAULT_IMPORT.exec(trimmed);
		if (defaultMatch) {
			applyDefaultImport(aliases, imports, defaultMatch[1], defaultMatch[2]);
			continue;
		}

		const namedMatch = RE_NAMED_IMPORT.exec(trimmed);
		if (namedMatch) {
			applyNamedImports(aliases, imports, namedMatch[1], namedMatch[2]);
		}
	}

	return { aliases, imports };
}

function stripImportLines(content: string): string {
	const lines = content.split('\n');
	let inCodeFence = false;

	return lines
		.filter((line) => {
			const trimmed = line.trim();
			if (/^(`{3,}|~{3,})/.test(trimmed)) {
				inCodeFence = !inCodeFence;
				return true;
			}
			if (inCodeFence) return true;
			return !/^import\s/.test(trimmed);
		})
		.join('\n');
}

function isWhitespaceTextNode(node: RehypeNode): boolean {
	return node.type === 'text' && typeof node.value === 'string' && node.value.trim() === '';
}

function isMdxComponentNode(node: RehypeNode): boolean {
	if (!String(node.type ?? '').startsWith('mdxJsx')) return false;
	const name = typeof node.name === 'string' ? node.name : '';
	return /^[A-Z]/.test(name);
}

function shouldUnwrapParagraph(node: RehypeNode): boolean {
	if (node.type !== 'element' || node.tagName !== 'p' || !Array.isArray(node.children)) {
		return false;
	}

	let hasComponent = false;

	for (const child of node.children) {
		if (isWhitespaceTextNode(child)) continue;
		if (isMdxComponentNode(child)) {
			hasComponent = true;
			continue;
		}

		return false;
	}

	return hasComponent;
}

function normalizeMdxParagraphs(root: RehypeNode) {
	function visit(node: RehypeNode) {
		if (!Array.isArray(node.children)) return;

		for (const child of node.children) {
			visit(child);
		}

		node.children = node.children.flatMap((child) => {
			if (!shouldUnwrapParagraph(child)) return [child];

			return (child.children ?? []).filter((grandChild) => !isWhitespaceTextNode(grandChild));
		});
	}

	visit(root);
}

function usePlugins(processor: any, plugins: unknown[] | undefined) {
	plugins?.forEach((plugin) => {
		if (Array.isArray(plugin)) {
			processor.use(plugin[0], plugin[1]);
			return;
		}

		processor.use(plugin);
	});
}

function parseId(id: string) {
	const [filepath, query = ''] = id.split('?', 2);
	const queryParams = new URLSearchParams(query);

	return {
		filepath,
		queryParams
	};
}

function getRemarkRehypeOptions(plugins: unknown[] | undefined): RemarkRehypeOptions {
	for (const plugin of plugins ?? []) {
		if (Array.isArray(plugin) && plugin[0] === remarkRehype) {
			return (plugin[1] as RemarkRehypeOptions) ?? {};
		}

		if (plugin === remarkRehype) {
			return {};
		}
	}

	return {};
}

export function mdToAst(markdownConfig: MarkdownConfig): PluginOption {
	return {
		name: 'vite-plugin-md-to-ast',
		enforce: 'pre',
		async transform(code, id) {
			const { filepath, queryParams } = parseId(id);

			if (!markdownConfig.extensions.some((ext) => filepath.endsWith(ext))) {
				return null;
			}

			if (queryParams.has('raw') || queryParams.has('url')) {
				return null;
			}

			const { data: metadata, content: rawContent } = matter(code);
			const mdxImportData = extractImportData(rawContent);
			const content = stripImportLines(rawContent);
			const remarkPlugins = (markdownConfig.remarkPlugins ?? []) as unknown[];

			const remarkPluginsWithoutBridge = remarkPlugins.filter((plugin) => {
				if (Array.isArray(plugin)) return plugin[0] !== remarkRehype;
				return plugin !== remarkRehype;
			});

			const configuredBridgeOptions = getRemarkRehypeOptions(remarkPlugins);
			const passThrough = Array.from(
				new Set([...(configuredBridgeOptions.passThrough ?? []), ...MDX_PASS_THROUGH])
			);

			const processor = unified().use(remarkParse).use(remarkMdx) as any;

			usePlugins(processor, remarkPluginsWithoutBridge);
			processor.use(remarkRehype as any, {
				...configuredBridgeOptions,
				passThrough
			});
			usePlugins(processor, (markdownConfig.rehypePlugins ?? []) as unknown[]);

			const markdownTree = processor.parse(content) as MdastNode;

			if (hasScriptTagNodes(markdownTree)) {
				this.warn(
					`[md-to-ast] <script> tags in "${filepath}" are ignored. Use top-level import statements instead (e.g. \`import Foo from './foo.svelte'\`).`
				);
			}

			const tree = await processor.run(markdownTree);
			const ast = tree as RehypeNode;
			normalizeMdxParagraphs(ast);

			const enrichedMetadata = {
				...metadata,
				mdxComponentAliases: mdxImportData.aliases,
				mdxComponentImports: mdxImportData.imports
			};

			return {
				code: `export default ${JSON.stringify({ ast, metadata: enrichedMetadata })};`,
				map: null
			};
		}
	};
}
