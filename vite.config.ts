import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import markdownConfig from './src/lib/markdown/markdown.config';
import { docIconManifest } from './plugins/vite-doc-icon-manifest';
import { mdxComponentManifest } from './plugins/vite-mdx-component-manifest';
import { mdToAst } from './plugins/vite-md-to-ast';

export default defineConfig({
	plugins: [
		docIconManifest({ navigationPath: 'src/lib/server/navigation/doc-navigation.config.ts' }),
		mdxComponentManifest(),
		mdToAst(markdownConfig),
		tailwindcss(),
		sveltekit()
	]
});
