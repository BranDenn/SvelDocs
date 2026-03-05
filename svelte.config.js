import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	extensions: ['.svelte'],
	kit: {
		adapter: adapter(),
		alias: {
			$components: 'src/lib/components',
			$ui: 'src/lib/components/ui',
			$utils: 'src/lib/utils',
			$css: 'src/app.css'
		},
		prerender: {
			handleHttpError: 'warn',
			handleMissingId: 'warn'
		}
	}
};

export default config;
