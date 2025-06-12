import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	ssr: {
		noExternal: ['flexsearch'] // This fixes following error "Cannot use 'import.meta' outside a module" that may occur on some computers
	},
	server: {
		fs: {
			allow: ['doc.config.ts', 'mdsvex.config.js']
		}
	}
});
