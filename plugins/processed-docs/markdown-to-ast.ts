import matter from 'gray-matter';
import type { Root as HastRoot } from 'hast';
import type { Root as MdastRoot } from 'mdast';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkStringify from 'remark-stringify';
import remarkRehype, { type Options as RemarkRehypeOptions } from 'remark-rehype';
import markdownConfig from '../../src/lib/markdown/configuration/markdown.config';
import { extractImportDataFromRaw, stripImportLines } from './mdx-import-utils.js';

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
	private: boolean;
};

export type MarkdownAstResult = {
	/**
	 * The transformed raw content after applying remark plugins, but before remark-rehype conversion.
	 * This is used for `[...docs].md` routes to ensure consistent content for Artificial Intelligence.
	 * For example, the <FileReader /> component would be transformed into an actual code block since the file is not actually accessible.
	 */
	rawContent: string;
	/**
	 * A plain text representation of the markdown content, extracted from the HAST.
	 * This is used for search indexing and should not contain any markdown syntax or HTML tags.
	 */
	searchContent: string;
	/**
	 * The metadata extracted from the markdown frontmatter.
	 */
	metadata: MarkdownMetadata;
	/**
	 * A mapping of import source to variable name for all js imports found in the raw markdown content.
	 * For example, if the markdown contains `import MyComponent from './MyComponent.svelte'`, this would include an entry like `{ './MyComponent.svelte': 'MyComponent' }`.
	 * This allows downstream processing to understand which components are being used and where they come from.
	 */
	imports: Record<string, string>;
	/**
	 * The final HAST (Hypertext Abstract Syntax Tree) representation of the markdown content after processing with remark and rehype plugins.
	 * This is required to pass markdown content safely from the server to client. This is neccessary for server side rendering.
	 */
	ast: HastRoot;
};

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
	const remarkProcessor = unified()
		.use([remarkParse, remarkMdx, ...remarkPluginsWithoutBridge])
		.freeze();

	const configuredBridgeOptions = getRemarkRehypeOptions(remarkPlugins);
	const passThrough: NonNullable<RemarkRehypeOptions['passThrough']> = Array.from(
		new Set([...(configuredBridgeOptions.passThrough ?? []), ...MDX_PASS_THROUGH])
	);
	const rehypeOptions: RemarkRehypeOptions = {
		...configuredBridgeOptions,
		passThrough
	};

	// Use remark-rehype in mutate mode so the run() result is HAST.
	const fullProcessor = remarkProcessor()
		.use(remarkRehype, rehypeOptions)
		.use(rehypePlugins)
		.freeze();

	// get transformed raw content (markdown content with remark plugins applied) first
	const transformedRawContent = String(
		await remarkProcessor().use(remarkStringify).process(rawContent)
	);

	const mdast = fullProcessor.parse(contentWithoutImports) as MdastRoot;
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
