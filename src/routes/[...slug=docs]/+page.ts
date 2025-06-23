import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { NavMap, loadNavMap, getMarkdownText } from '$lib/docs';
import { NAVIGATION } from '$settings';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { remarkAlert } from 'remark-github-blockquote-alert';
import { unified } from 'unified';
import fm from 'front-matter';

export const prerender = true;

export const load: PageLoad = async ({ url, fetch }) => {
	// load navmap if it is not already loaded
	if (NavMap.size <= 0) {
		const response = await fetch('/api/docs');
		const data = await response.json();
		loadNavMap(NAVIGATION, data);
	}

	// get the navmap item
	const navMapItem = NavMap.get(url.pathname);

	// ensure url exists
	if (!navMapItem) return error(404, 'This page does not exist.');

	// try to load the markdown file based off the url
	try {
		const markdown = await getMarkdownText(navMapItem.folder, navMapItem.title);
		const { body } = fm(markdown);

		const html = (
			await unified()
				.use(remarkParse)
				.use(remarkGfm)
				.use(remarkAlert)
				.use(remarkRehype)
				.use(rehypeSlug)
				.use(rehypePrettyCode, {
					theme: {
						light: 'github-light',
						dark: 'github-dark'
					},
					keepBackground: false,
				})
				.use(rehypeStringify)
				.process(body)
		).toString();

		return {
			title: navMapItem.title,
			group: navMapItem.group,
			mdTitle: navMapItem.markdown?.title,
			mdDescription: navMapItem.markdown?.description,
			html: html
		};
	} catch {
		return error(403, 'The content for this page could not be loaded.');
	}
};
