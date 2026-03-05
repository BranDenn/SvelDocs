import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';
import { getPublicDocEntries, loadDocAst } from '$lib/server/content/docs-loader';

export const entries: EntryGenerator = () => {
	return getPublicDocEntries();
};

export const load: PageServerLoad = async ({ params, locals }) => {
	const docAstData = await loadDocAst(params.slug);

	// Check if user has access to private docs
	if (docAstData.access === 'private' && !locals.emulated) {
		throw error(404, 'Document not found');
	}

	return docAstData;
}