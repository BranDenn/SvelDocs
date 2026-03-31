import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import remarkFileReader from './plugins/remark/remark-file-reader';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import { defineConfig } from './define-config';
import { rehypeMarkdownAstPlugins } from './plugins/rehype';

const markdownConfig = defineConfig({
	extensions: ['.md', '.mdx'],
	remarkPlugins: [
		remarkGfm,
		remarkFileReader,
		[
			remarkRehype,
			{
				footnoteBackContent: '↩\uFE0E'
			}
		]
	],
	rehypePlugins: [
		rehypeSlug,
		[
			rehypePrettyCode,
			{
				theme: {
					light: 'github-light',
					dark: 'github-dark'
				},
				keepBackground: false
			}
		],
		...rehypeMarkdownAstPlugins
	]
});

export default markdownConfig;
