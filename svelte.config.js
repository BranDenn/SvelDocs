import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	extensions: ['.svelte', '.md'],
	kit: {
		adapter: adapter(),
		alias: {
			$settings: 'doc.config.ts'
		}
	}
};

export default config;
