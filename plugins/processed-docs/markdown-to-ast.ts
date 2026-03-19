import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkRehype, { type Options as RemarkRehypeOptions } from 'remark-rehype';
import markdownConfig from '../../src/lib/markdown/markdown.config';
import {
	extractImportDataFromMdast,
	extractImportDataFromRaw,
	stripImportLines,
	stripMdxEsmNodes
} from '../../src/lib/markdown/mdx-import-utils';

type RehypeNode = { type: string; children?: RehypeNode[]; [key: string]: unknown };
type MdastNode = { type?: string; value?: string; children?: MdastNode[]; [key: string]: unknown };

const MDX_PASS_THROUGH = ['mdxJsxFlowElement', 'mdxJsxTextElement'];

function usePlugins(processor: any, plugins: unknown[] | undefined) {
	plugins?.forEach((plugin) => {
		if (Array.isArray(plugin)) {
			processor.use(plugin[0], plugin[1]);
			return;
		}

		processor.use(plugin);
	});
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

function extractTextFromAstNode(node: unknown, buffer: string[]): void {
	if (!node || typeof node !== 'object') {
		return;
	}

	const nodeObj = node as Record<string, unknown>;

	if (typeof nodeObj.value === 'string') {
		const value = nodeObj.value.trim();
		if (value) {
			buffer.push(value);
		}
	}

	if (Array.isArray(nodeObj.children)) {
		for (const child of nodeObj.children) {
			extractTextFromAstNode(child, buffer);
		}
	}
}

function extractTextFromAst(ast: unknown): string {
	const buffer: string[] = [];
	extractTextFromAstNode(ast, buffer);
	return buffer.join(' ').replaceAll(/\s+/g, ' ').trim();
}

export type MarkdownAstResult = {
	raw: string;
	content: string;
	metadata: Record<string, unknown>;
	ast: unknown;
};

const markdownExtensions = markdownConfig.extensions.map((ext) => ext.toLowerCase());

export function isMarkdownModulePath(filePath: string): boolean {
	const lowerPath = filePath.toLowerCase();
	return markdownExtensions.some((ext) => lowerPath.endsWith(ext));
}

export async function markdownToAst(rawMarkdown: string): Promise<MarkdownAstResult> {
	const { data: metadata, content: rawContent } = matter(rawMarkdown);
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

	const tree = await processor.run(markdownTree);
	const ast = tree as RehypeNode;

	const enrichedMetadata = {
		...metadata,
		mdxComponentAliases: mdxImportData.aliases,
		mdxComponentImports: mdxImportData.imports
	};

	return {
		raw: rawMarkdown,
		content: extractTextFromAst(ast),
		metadata: enrichedMetadata,
		ast
	};
}
