import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import { defineConfig } from './define-config';

const markdownConfig = defineConfig({
	extensions: ['.md', '.mdx'],
	remarkPlugins: [
		remarkGfm,
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
		]
	]
});

export default markdownConfig;
