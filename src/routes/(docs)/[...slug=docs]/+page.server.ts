import type { EntryGenerator, PageServerLoad } from './$types';
import { getPublicDocEntries, loadDocAst } from '$lib/server/content/docs-loader';

export const entries: EntryGenerator = () => {
	return getPublicDocEntries();
};

export const load: PageServerLoad = async ({ params, locals }) => {
	return loadDocAst(params.slug, locals);
};
