import { json } from '@sveltejs/kit';
import { NAVIGATION } from '$settings';
import type { Doc } from '$lib/docs';
import removeMd from 'remove-markdown';
import fm from 'front-matter';

export const prerender = true;

export async function GET() {
	const modules = import.meta.glob('$lib/markdown/*/*.md', { eager: true, query: 'raw' });
	let docs: Doc[] = [];

	NAVIGATION.forEach((navGroup) => {
		navGroup.items.forEach((navItem) => {
			const group = navGroup.group;
			const folder = navGroup.folder;
			const title = navItem.title;

			let data: Doc = {
				group,
				title
			};

			const file_name = title.toLowerCase().replaceAll(' ', '-');
			const module = modules[`/src/lib/markdown/${folder}/${file_name}.md`];

			if (module?.default) {
				const frontMatter = fm(module.default);
				if ('attributes' in frontMatter) {
					const attributes = frontMatter.attributes as Object;
					if ('title' in attributes) data.mdTitle = attributes.title as string;
					if ('description' in attributes) data.mdDescription = attributes.description as string;
				}
				let content = removeMd(frontMatter.body);
				// content = content.replace(/(\r\n|\r|\n)+/g, '\n');
				content = content.replace(/[\r\t\f\v\n ]+/g, ' ');
				content = content.replaceAll('\n ', '\n');
				content = content.trim();
				if (content) data.mdContent = content;
			}

			docs.push(data);
		});
	});

	return json(docs);
}
