import { json } from '@sveltejs/kit';
import { NAVIGATION } from '$settings';
import type { Doc } from '$lib/docs';
import matter from 'gray-matter';
import remarkStringify from 'remark-stringify'
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import stripMarkdown from 'strip-markdown';

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
				const file_name = title.toLowerCase().replaceAll(' ', '-');
				const md = await import(`/src/lib/markdown/${folder}/${file_name}.md?raw`);

				const { content, data } = matter(md.default);

				if (data.title) docData.mdTitle = data.title
				if (data.description) docData.mdDescription = data.description

				const text = (
					await unified()
						.use(remarkParse)
						.use(stripMarkdown)
						.use(remarkStringify)
						.process(content)
				).toString()

				if (text) docData.mdContent = text.replace(/\s+/g, ' ').trim()
			} catch {}

			docs.push(docData);
		}
	}

	return json(docs);
}
