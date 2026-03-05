import type { LayoutServerLoad } from './$types';
import { getDocSidebarTabs, getDocTabs } from '$lib/server/content/docs-loader';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		tabs: getDocTabs(),
		sidebarTabs: getDocSidebarTabs(locals)
	};
};
