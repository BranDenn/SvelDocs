import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { NavMap, loadNavMap } from '$lib/docs';
import { NAVIGATION } from '$settings';

export const load: PageLoad = async ({ url, fetch }) => {
	if (NavMap.size <= 0) {
		const response = await fetch('/api/docs');
		const data = await response.json()
		loadNavMap(NAVIGATION, data);
	}

	const navItem = NavMap.get(url.pathname);

	// ensure url exists
	if (!navItem) return error(404, 'This page does not exist.');

	// try to load the markdown file based off the url
	try {
		const file_name = navItem.title.toLowerCase().replaceAll(' ', '-');
		const md = await import(`$lib/markdown/${navItem.folder}/${file_name}.md`);

		return {
			component: md.default,
			meta: md.metadata
		};
	} catch {
		return error(403, 'The content for this page could not be loaded.');
	}
};
