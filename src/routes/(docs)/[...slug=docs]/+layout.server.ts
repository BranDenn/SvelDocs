import type { LayoutServerLoad } from './$types';
import { getDocSidebarTabs, buildDocNavigationParams } from '$lib/server/content/docs-loader';

export const load: LayoutServerLoad = async ({ locals }) => {
	const sidebarTabs = getDocSidebarTabs(locals);
	return {
		sidebarTabs,
		navigationParams: buildDocNavigationParams(sidebarTabs),
		emulated: locals.emulated
	};
};
