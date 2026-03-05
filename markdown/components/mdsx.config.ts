import { defineConfig } from 'mdsx';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import remarkRehype from 'remark-rehype';
import rehypePrettyCode from 'rehype-pretty-code';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const mdsxConfig = defineConfig({
	extensions: ['.md'],
	remarkPlugins: [
		remarkGfm,
		[
			remarkRehype,
			{
				footnoteBackContent: '↩\u{FE0E}' // fix to prevent default emoji icon
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
	],
	blueprints: {
		default: {
			path: resolve(__dirname, './blueprint.svelte')
		}
	}
});
