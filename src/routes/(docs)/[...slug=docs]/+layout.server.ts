import type { LayoutServerLoad } from './$types';
import {
	getDocSidebarTabs,
	buildDocNavigationParams,
	buildDocSearchGroups
} from '$lib/server/content/docs-loader';

export const load: LayoutServerLoad = async ({ locals }) => {
	const sidebarTabs = getDocSidebarTabs(locals);
	const navigation = buildDocNavigationParams(sidebarTabs);
	const searchGroups = buildDocSearchGroups(sidebarTabs);

	return {
		navigation,
		searchGroups,
		emulated: locals.emulated
	};
};
