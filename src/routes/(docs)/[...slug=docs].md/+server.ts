import { error } from '@sveltejs/kit';
import type { EntryGenerator, RequestHandler } from './$types';
import { canAccessDoc } from '$lib/server/content/docs-access';
import { getDocsData, getPublicDocEntries } from '$lib/server/content/docs-data';

export const prerender = true;

export const entries: EntryGenerator = () => {
	return getPublicDocEntries();
};

export const GET: RequestHandler = async ({ params, locals }) => {
	const docData = getDocsData(params.slug);
	if (!canAccessDoc(locals.emulated, docData.private)) {
		throw error(404, 'Document not found');
	}

	const headingTitle = docData.title.replaceAll(/\r?\n/g, ' ').trim();
	const titleHeading = headingTitle ? `# ${headingTitle}\n\n` : '';
	const rawMarkdown = docData.markdown.raw;
	const markdownWithTitle = rawMarkdown.startsWith('---')
		? rawMarkdown.replace(/^---\n[\s\S]*?\n---\n*/, (frontmatter) => `${frontmatter}${titleHeading}`)
		: `${titleHeading}${rawMarkdown}`;

	return new Response(markdownWithTitle, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8'
		}
	});
};