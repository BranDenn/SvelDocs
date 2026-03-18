import type { LayoutServerLoad } from './$types';
import { canAccessDoc } from '$lib/server/content/docs-access';
import { getDocLayoutData } from '$lib/server/content/docs-data';

export const load: LayoutServerLoad = async ({ locals }) => {
	// replace `false` with `locals` for checking authentication
	const { navigation, searchGroups } = getDocLayoutData((doc) => canAccessDoc(false, doc.private));

	return {
		navigation,
		searchGroups
	};
};
