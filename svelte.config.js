import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsx } from 'mdsx';
import { mdsxConfig } from './mdsx.config.js';

const config = {
	preprocess: [mdsx(mdsxConfig), vitePreprocess()],
	extensions: ['.svelte', ...mdsxConfig.extensions],
	kit: {
		adapter: adapter(),
		alias: {
			$settings: 'doc.config.ts'
		}
	}
};

export default config;
