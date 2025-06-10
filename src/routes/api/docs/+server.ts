import { json } from '@sveltejs/kit';
import { NAVIGATION, type MdFm } from '$settings';
import { type Doc, getMarkdownText } from '$lib/docs';
import remarkStringify from 'remark-stringify';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import stripMarkdown from 'strip-markdown';
import fm from 'front-matter';

export const prerender = true;

export async function GET() {
	let docs: Doc[] = [];

	for (const navGroup of NAVIGATION) {
		for (const navItem of navGroup.items) {
			const group = navGroup.group;
			const folder = navGroup.folder;
			const title = navItem.title;

			let docData: Doc = {
				group,
				title
			};

			try {
				const markdown = await getMarkdownText(folder, title);
				const { attributes, body } = fm<MdFm>(markdown);

				docData.markdown = attributes;

				const text = (
					await unified().use(remarkParse).use(stripMarkdown).use(remarkStringify).process(body)
				).toString();

				docData.markdown.content = text.replace(/\s+/g, ' ').trim();
			} catch {}

			docs.push(docData);
		}
	}

	return json(docs);
}
