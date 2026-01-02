import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import iconManifestPlugin from './src/vite-plugins/icon-manifest';

export default defineConfig({
	plugins: [iconManifestPlugin(), tailwindcss(), sveltekit()],
	ssr: {
		noExternal: ['flexsearch'] // This fixes following error "Cannot use 'import.meta' outside a module" that may occur on some computers
	},
	server: {
		fs: {
			allow: []
		}
	}
});
