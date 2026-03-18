import adapter from '@sveltejs/adapter-auto';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export const IS_STATIC_BUILD = true;

const config = {
	preprocess: vitePreprocess(),
	extensions: ['.svelte'],
	kit: {
		adapter: IS_STATIC_BUILD ? adapterStatic() : adapter(),
		alias: {
			$components: 'src/lib/components',
			$ui: 'src/lib/components/ui',
			$utils: 'src/lib/utils',
			$css: 'src/app.css'
		},
		paths: {
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
		},
		prerender: {
			handleHttpError: 'warn',
			handleMissingId: 'warn'
		}
	}
};

export default config;
