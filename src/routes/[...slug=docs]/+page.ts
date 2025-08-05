import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { NavMap, loadNavMap, getMarkdownComponent } from '$lib/docs';
import { NAVIGATION } from '$settings';
import { resolve } from '$app/paths';

export const load: PageLoad = async ({ fetch, params }) => {
	// load navmap if it is not already loaded
	if (NavMap.size <= 0) {
		try {
			const response = await fetch(resolve('/api/docs.json'));
			const data = await response.json();
			loadNavMap(NAVIGATION, data);
		} catch (err) {
			console.error('Failed to load navigation map:', err);
			return error(500, 'Failed to load navigation map.');
		}
	}

	// get the navmap item
	// using params.slug instead of url.pathname to ensure it works with the base path set in svelte.config.js
	const navMapItem = NavMap.get(`/${params.slug}`);

	// ensure url exists
	if (!navMapItem) return error(404, 'This page does not exist.');

	// try to load the markdown file based off the url
	try {
		const { component } = await getMarkdownComponent(navMapItem.folder, navMapItem.title);

		// remove content as it is not needed in the page data
		const { content, ...md } = navMapItem.markdown || {};

		return {
			title: navMapItem.title,
			group: navMapItem.group,
			md: md,
			component: component
		};
	} catch {
		return error(403, 'The content for this page could not be loaded.');
	}
};
