import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { NavMap, loadNavMap } from '$lib/docs';
import { NAVIGATION } from '$settings';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { remarkAlert } from 'remark-github-blockquote-alert'
import { unified } from 'unified';
import fm from 'front-matter'

export const prerender = true

export const load: PageLoad = async ({ url, fetch }) => {
	if (NavMap.size <= 0) {
		const response = await fetch('/api/docs');
		const data = await response.json();
		loadNavMap(NAVIGATION, data);
	}

	const navItem = NavMap.get(url.pathname);

	// ensure url exists
	if (!navItem) return error(404, 'This page does not exist.');

	// try to load the markdown file based off the url
	try {
		const file_name = navItem.title.toLowerCase().replaceAll(' ', '-');
		const md = await import(/* @vite-ignore */ `/src/lib/markdown/${navItem.folder}/${file_name}.md?raw`);

		const { attributes, body } = fm(md.default);
		
		const html = (
			await unified()
				.use(remarkParse)
				.use(remarkGfm)
				.use(remarkAlert, { legacyTitle: false})
				.use(remarkRehype, { allowDangerousHtml: true })
				.use(rehypeSlug)
				.use(rehypeAutolinkHeadings, { behavior: 'wrap' })
				.use(rehypePrettyCode, {
					theme: {
						light: 'github-light',
						dark: 'github-dark'
					},
					keepBackground: false,
					grid: true
				})
				.use(rehypeStringify, { allowDangerousHtml: true })
				.process(body)
		).toString();

		return {
			meta: attributes,
			html: html
		}
	} catch(e) {
		console.log(e)
		return error(403, 'The content for this page could not be loaded.');
	}
};
