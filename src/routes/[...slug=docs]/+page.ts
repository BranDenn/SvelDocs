import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { NavMap, loadNavMap, getMarkdownComponent } from '$lib/docs';
import { NAVIGATION } from '$settings';

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
