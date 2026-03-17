import matter from 'gray-matter';
import type { PluginOption } from 'vite';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkRehype, { type Options as RemarkRehypeOptions } from 'remark-rehype';
import type { MarkdownConfig } from '../src/lib/markdown/define-config';
import {
	extractImportDataFromMdast,
	extractImportDataFromRaw,
	stripImportLines,
	stripMdxEsmNodes
} from '../src/lib/markdown/mdx-import-utils';

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
	function isMdxJsxNode(node: RehypeNode): boolean {
		return String(node.type ?? '').startsWith('mdxJsx');
	}

	function unwrapSingleParagraphChildInMdxComponent(node: RehypeNode): RehypeNode {
		if (!isMdxJsxNode(node) || !Array.isArray(node.children)) {
			return node;
		}

		const meaningfulChildren = node.children.filter((child) => !isWhitespaceTextNode(child));
		if (meaningfulChildren.length !== 1) {
			return node;
		}

		const onlyChild = meaningfulChildren[0];
		if (
			onlyChild.type !== 'element' ||
			onlyChild.tagName !== 'p' ||
			!Array.isArray(onlyChild.children)
		) {
			return node;
		}

		return {
			...node,
			children: onlyChild.children
		};
	}

	function visit(node: RehypeNode) {
		if (!Array.isArray(node.children)) return;

		for (const child of node.children) {
			visit(child);
		}

		node.children = node.children.flatMap((child) => {
			if (shouldUnwrapParagraph(child)) {
				return (child.children ?? []).filter((grandChild) => !isWhitespaceTextNode(grandChild));
			}

			return [unwrapSingleParagraphChildInMdxComponent(child)];
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

			let markdownTree: MdastNode;
			let mdxImportData: { aliases: Record<string, string[]>; imports: Record<string, string> };

			try {
				markdownTree = processor.parse(rawContent) as MdastNode;
				mdxImportData = extractImportDataFromMdast(markdownTree);
				stripMdxEsmNodes(markdownTree);
			} catch {
				const parseContent = stripImportLines(rawContent);
				markdownTree = processor.parse(parseContent) as MdastNode;
				mdxImportData = extractImportDataFromRaw(rawContent);
			}

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
