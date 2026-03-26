import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';
import { canAccessDoc } from '$lib/server/content/docs-access';
import { getDocsData, getPublicDocEntries, getDocPageData } from '$lib/server/content/docs-data';
export { prerender } from '$lib/server/content/docs-data';

export const entries: EntryGenerator = () => {
	return getPublicDocEntries().map((doc) => ({ slug: doc.slug }));
};

export const load: PageServerLoad = async ({ params, locals }) => {
	const docData = getDocsData(params.slug);

	// replace `false` with `locals` for checking authentication
	if (!canAccessDoc(false, docData.private)) {
		error(404, 'Document not found');
	}

	return getDocPageData(docData);
};
