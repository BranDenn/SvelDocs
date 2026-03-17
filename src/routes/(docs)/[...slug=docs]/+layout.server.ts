import type { LayoutServerLoad } from './$types';
import { canAccessDoc } from '$lib/server/content/docs-access';
import { getDocLayoutData } from '$lib/server/content/docs-data';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { navigation, searchGroups } = getDocLayoutData((doc) =>
		canAccessDoc(locals.emulated, doc.private)
	);

	return {
		navigation,
		searchGroups,
		emulated: locals.emulated
	};
};
