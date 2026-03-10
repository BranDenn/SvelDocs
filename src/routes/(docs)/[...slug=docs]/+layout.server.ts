import type { LayoutServerLoad } from './$types';
import { getDocSidebarTabs, buildDocNavigationParams } from '$lib/server/content/docs-loader';

export const load: LayoutServerLoad = async ({ locals }) => {
	const sidebarTabs = getDocSidebarTabs(locals);
	const navigation = buildDocNavigationParams(sidebarTabs);

	return {
		navigation,
		emulated: locals.emulated
	};
};
