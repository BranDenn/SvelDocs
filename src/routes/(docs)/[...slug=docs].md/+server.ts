import { error } from '@sveltejs/kit';
import matter from 'gray-matter';
import type { EntryGenerator, RequestHandler } from './$types';
import { canAccessDoc } from '$lib/server/content/docs-access';
import { getDocsData, getPublicDocEntries } from '$lib/server/content/docs-data';
export { prerender } from '$lib/server/content/docs-data';

export const entries: EntryGenerator = () => {
	return getPublicDocEntries();
};

export const GET: RequestHandler = async ({ params, locals }) => {
	const docData = getDocsData(params.slug);

	// replace `false` with `locals` for checking authentication
	if (!canAccessDoc(false, docData.private)) {
		throw error(404, 'Document not found');
	}

	const headingTitle = docData.title.replaceAll(/\r?\n/g, ' ').trim();
	const parsed = matter(docData.markdown.raw);
	const description =
		typeof parsed.data.description === 'string'
			? `> ${parsed.data.description.replaceAll(/\r?\n/g, ' ').trim()}`
			: '';
	const titleHeading = headingTitle ? `# ${headingTitle}` : '';
	const titleBlock = [titleHeading, description].filter(Boolean).join('\n\n');
	const titlePrefix = titleBlock ? `${titleBlock}\n\n` : '';
	const contentWithTitle = `${titlePrefix}${parsed.content}`;
	const markdownWithTitle = parsed.matter
		? matter.stringify(contentWithTitle, parsed.data)
		: contentWithTitle;

	return new Response(markdownWithTitle, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8'
		}
	});
};