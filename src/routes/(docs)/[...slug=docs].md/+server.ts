import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { canAccessDoc } from '$lib/server/docs/docs-access';
import { getDocsData } from '$lib/server/docs/docs-data';
export { prerender, entries } from '$lib/server/docs/docs-data';

export const GET: RequestHandler = async ({ locals, url }) => {
	const docData = getDocsData(url.pathname.replace(/\.md$/i, ''));

	// replace `false` with `locals` for checking authentication
	if (!canAccessDoc(false, docData.private)) {
		throw error(404, 'Document not found');
	}

	let txt = `# ${docData.title}`;

	const metadata = docData.markdown.metadata;
	if ('description' in metadata && typeof metadata.description === 'string' && metadata.description.trim() !== '') {
		txt += `\n\n> ${metadata.description}`;
	}

	const body = `${txt}\n\n${docData.markdown.rawContent}`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8'
		}
	});
};