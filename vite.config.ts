import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import markdownConfig from './src/lib/markdown/markdown.config';
import { docIconManifest } from './plugins/vite-doc-icon-manifest';
import { mdToAst } from './plugins/vite-md-to-ast';

export default defineConfig({
	plugins: [docIconManifest(), mdToAst(markdownConfig), tailwindcss(), sveltekit()]
});
