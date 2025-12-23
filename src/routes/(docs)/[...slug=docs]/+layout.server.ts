import type { LayoutServerLoad } from './$types';
import { generateDocs } from '$lib/docs/navigation/doc-navigation.server';

export const load: LayoutServerLoad = async () => {
	// do optional auth checks here

	const docNavigation = generateDocs();
	return { docNavigation };
};
