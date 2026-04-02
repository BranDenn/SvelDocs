import matter from 'gray-matter';
import type { Root as HastRoot } from 'hast';
import type { Root as MdastRoot } from 'mdast';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkStringify from 'remark-stringify';
import remarkRehype, { type Options as RemarkRehypeOptions } from 'remark-rehype';
import markdownConfig from '../../src/lib/markdown/markdown.config';
import {
	extractImportDataFromRaw,
	stripImportLines
} from '../../src/lib/markdown/mdx-import-utils.js';

type MdastNode = { type?: string; value?: string; children?: MdastNode[]; [key: string]: unknown };

const MDX_PASS_THROUGH = ['mdxJsxFlowElement', 'mdxJsxTextElement'] as const;

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

export type MarkdownMetadata = {
	title?: string;
	description?: string;
	keywords?: string[] | string;
	icon?: string;
	[key: string]: unknown;
};

export type MarkdownAstResult = {
	rawContent: string;
	searchContent: string;
	metadata: MarkdownMetadata;
	imports: Record<string, string>;
	ast: HastRoot;
};

export function isMarkdownModulePath(filePath: string): boolean {
	return /\.(md|mdx)$/i.test(filePath);
}


export async function getMarkdownData(rawMarkdown: string): Promise<MarkdownAstResult> {
	const { data, content: rawContent } = matter(rawMarkdown);
	const metadata = data as MarkdownMetadata;
	const contentWithoutImports = stripImportLines(rawContent);

	const remarkPlugins = markdownConfig.remarkPlugins ?? [];
	const rehypePlugins = markdownConfig.rehypePlugins ?? [];

	const remarkPluginsWithoutBridge = remarkPlugins.filter((plugin) => {
		if (Array.isArray(plugin)) return plugin[0] !== remarkRehype;
		return plugin !== remarkRehype;
	});

    // setup remark processor
    const remarkProcessor = unified().use([
        remarkParse, 
        remarkMdx, 
        ...remarkPluginsWithoutBridge
    ]).freeze();

    const configuredBridgeOptions = getRemarkRehypeOptions(remarkPlugins);
	const passThrough: NonNullable<RemarkRehypeOptions['passThrough']> = Array.from(
		new Set([...(configuredBridgeOptions.passThrough ?? []), ...MDX_PASS_THROUGH])
	);
	const rehypeOptions: RemarkRehypeOptions = {
		...configuredBridgeOptions,
		passThrough
	};

	// Use remark-rehype in mutate mode so the run() result is HAST.
	const fullProcessor = remarkProcessor().use(remarkRehype, rehypeOptions).use(rehypePlugins).freeze()

    // get transformed raw content (markdown content with remark plugins applied) first
    const transformedRawContent = String(await remarkProcessor().use(remarkStringify).process(rawContent));

	const mdast = fullProcessor.parse(contentWithoutImports) as MdastRoot
	const mdxImportData = extractImportDataFromRaw(rawContent);
	const hast = await fullProcessor.run(mdast);

	return {
		rawContent: transformedRawContent,
		searchContent: extractTextFromAst(hast),
		metadata,
		imports: mdxImportData.imports,
		ast: hast
	};
}
