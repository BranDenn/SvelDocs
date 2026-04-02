import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { iconManifest } from './plugins/vite-icon-manifest';
import { mdxComponentManifest } from './plugins/vite-mdx-component-manifest';
import { docSearchJson } from './plugins/vite-search-json';

export default defineConfig({
	plugins: [
		iconManifest({
			files: ['src/lib/server/docs/navigation/doc-navigation.config.ts'],
			iconPackage: '@lucide/svelte/icons'
		}),
		mdxComponentManifest(),
		docSearchJson({ files: ['content'] }),
		tailwindcss(),
		sveltekit()
	]
});
