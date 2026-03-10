import matter from 'gray-matter';
import type { PluginOption } from 'vite';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkRehype, { type Options as RemarkRehypeOptions } from 'remark-rehype';
import ts from 'typescript';
import type { MarkdownConfig } from '../src/lib/markdown/define-config';

type RehypeNode = { type: string; children?: RehypeNode[]; [key: string]: unknown };
type MdastNode = { type?: string; value?: string; children?: MdastNode[]; [key: string]: unknown };

const MDX_PASS_THROUGH = ['mdxJsxFlowElement', 'mdxJsxTextElement'];

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

function collectText(node: MdastNode): string {
	const parts: string[] = [];

	function walk(current: MdastNode) {
		if (typeof current.value === 'string') {
			parts.push(current.value);
		}

		for (const child of current.children ?? []) {
			walk(child);
		}
	}

	walk(node);
	return parts.join('\n').trim();
}

function collectImportSourcesFromTs(
	code: string
): Array<{ localName: string; importedName: string; source: string }> {
	const sourceFile = ts.createSourceFile(
		'mdx-imports.ts',
		code,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS
	);
	const results: Array<{ localName: string; importedName: string; source: string }> = [];

	for (const statement of sourceFile.statements) {
		if (!ts.isImportDeclaration(statement)) continue;
		if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;

		const source = statement.moduleSpecifier.text;
		const clause = statement.importClause;
		if (!clause) continue;

		if (clause.name) {
			results.push({
				localName: clause.name.text,
				importedName: 'default',
				source
			});
		}

		if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
			for (const element of clause.namedBindings.elements) {
				results.push({
					localName: element.name.text,
					importedName: element.propertyName?.text ?? element.name.text,
					source
				});
			}
		}
	}

	return results;
}

function applyImportToMaps(
	aliases: MdxComponentAliasMap,
	imports: MdxComponentImportMap,
	localName: string,
	importedName: string,
	source: string
) {
	const baseName = getImportSourceBaseName(source);

	addAlias(aliases, localName, [
		localName,
		importedName,
		baseName,
		baseName.toLowerCase(),
		toPascalCase(baseName)
	]);
	imports[localName] = source;
}

function extractMdxImportDataFromTree(root: MdastNode): {
	aliases: MdxComponentAliasMap;
	imports: MdxComponentImportMap;
} {
	const aliases: MdxComponentAliasMap = {};
	const imports: MdxComponentImportMap = {};

	function visit(node: MdastNode) {
		const isEsmNode = node.type === 'mdxjsEsm';
		const isScriptJsxNode =
			(node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
			node.name === 'script';

		if (isEsmNode || isScriptJsxNode) {
			const importCode = collectText(node);
			if (importCode) {
				for (const item of collectImportSourcesFromTs(importCode)) {
					applyImportToMaps(aliases, imports, item.localName, item.importedName, item.source);
				}
			}
		}

		for (const child of node.children ?? []) {
			visit(child);
		}
	}

	visit(root);

	return { aliases, imports };
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

			const { data: metadata, content } = matter(code);
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
			const mdxImportData = extractMdxImportDataFromTree(markdownTree);

			const uniqueImportSources = Array.from(new Set(Object.values(mdxImportData.imports)));
			for (const source of uniqueImportSources) {
				const resolved = await this.resolve(source, filepath);
				if (!resolved) {
					this.error(`Unresolved MDX import "${source}" in ${filepath}. Ensure the path is valid.`);
				}
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
