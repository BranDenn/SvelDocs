import type { EntryGenerator, RequestHandler } from './$types';
import { getPublicDocEntries, loadDocAst } from '$lib/server/content/docs-loader';

export const prerender = true;

export const entries: EntryGenerator = () => {
	return getPublicDocEntries();
};

export const GET: RequestHandler = async ({ params, locals }) => {
	const doc = await loadDocAst(params.slug, locals);

	return new Response(JSON.stringify(doc), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	});
};