import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { iconManifest } from './plugins/vite-icon-manifest';
import { mdxComponentManifest } from './plugins/vite-mdx-component-manifest';
import { docSearchJson } from './plugins/vite-search-json';
import { protectServerAssets } from './plugins/vite-server-only';
import { BASE_PATH } from './svelte.config.js';

export default defineConfig({
	plugins: [
		iconManifest({
			files: ['src/lib/docs/server/navigation/doc-navigation.config.ts'],
			iconPackage: '@lucide/svelte/icons'
		}),
		mdxComponentManifest(),
		docSearchJson({ markdownFolderPath: 'content', basePath: BASE_PATH }),
		tailwindcss(),
		sveltekit(),
		protectServerAssets({ folders: ['src/lib/docs/server'], files: [] })
	]
});
