import matter from 'gray-matter';
import type { PluginOption } from 'vite';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkRehype, { type Options as RemarkRehypeOptions } from 'remark-rehype';
import type { MarkdownConfig } from '../src/lib/markdown/define-config';

type RehypeNode = { type: string; children?: RehypeNode[]; [key: string]: unknown };

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

			const tree = await processor.run(processor.parse(content));
			const ast = tree as RehypeNode;

			return {
				code: `export default ${JSON.stringify({ ast, metadata })};`,
				map: null
			};
		}
	};
}
