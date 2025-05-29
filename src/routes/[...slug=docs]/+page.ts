import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { NavMap } from '$lib/docs';

export const load: PageLoad = async ({ params, url }) => {

    // ensure url exists
    if (!NavMap.has(url.pathname)) return error(404, "This page does not exist.")

    // try to load the markdown file based off the url
	try {
		const file_name: string | undefined = params.slug.split('/').at(-1);
		const group_folder: string | undefined = params.slug.split('/').at(-2);
		const md = await import(`$lib/markdown/${group_folder}/${file_name}.md`);

		return {
			component: md.default,
			meta: md.metadata
		};
	} catch {
		return error(403, "This content for this page could not be loaded.");
	}
};