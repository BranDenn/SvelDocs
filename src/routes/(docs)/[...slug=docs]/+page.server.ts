import type { EntryGenerator, PageServerLoad } from './$types';
import { getPublicDocEntries, loadDocAst } from '$lib/server/content/docs-loader';

export const entries: EntryGenerator = () => {
	return getPublicDocEntries();
};

export const load: PageServerLoad = async ({ params, locals }) => {
	const d = await loadDocAst(params.slug, locals);
	console.log(d);
	return d;
};
