import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';
import { canAccessDoc } from '$lib/server/content/docs-access';
import { getDocsData, getPublicDocEntries, getDocPageData } from '$lib/server/content/docs-data';

export const entries: EntryGenerator = () => {
	return getPublicDocEntries();
};

export const load: PageServerLoad = async ({ params, locals }) => {
	const docData = getDocsData(params.slug);

	if (!canAccessDoc(locals.emulated, docData.private)) {
		error(404, 'Document not found');
	}

	return getDocPageData(docData);
};
