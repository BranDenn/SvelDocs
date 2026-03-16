import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';
import { getPublicDocEntries, loadDocAst } from '$lib/server/content/docs-loader';

export const entries: EntryGenerator = () => {
	return getPublicDocEntries();
};

export const load: PageServerLoad = async ({ params, locals }) => {
	const docAstData = await loadDocAst(params.slug);

	if (docAstData.access !== false && !locals.emulated) {
		error(404, 'Document not found');
	}

	return docAstData;
};
