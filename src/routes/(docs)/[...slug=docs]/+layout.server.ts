import type { LayoutServerLoad } from './$types';
import { generateDocs } from '$lib/docs/navigation/doc-navigation.server';

// preloaded for server
const docs = generateDocs();

export const load: LayoutServerLoad = async () => {
	const docNavigation = docs;

	// do optional auth checks here to filter data...
	// although each page would need to have auth checks individual,
	// you should also filter tabs, groups, or pages here to prevent showing the pages in the sidebar / search

	return { docNavigation };
};
