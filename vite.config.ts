import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { docIconManifest } from './plugins/vite-doc-icon-manifest';
import { mdxComponentManifest } from './plugins/vite-mdx-component-manifest';

export default defineConfig({
	plugins: [
		docIconManifest({ navigationPath: 'src/lib/server/navigation/doc-navigation.config.ts' }),
		mdxComponentManifest(),
		tailwindcss(),
		sveltekit()
	]
});
