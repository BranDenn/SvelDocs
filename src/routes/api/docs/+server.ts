import { json } from '@sveltejs/kit';
import { render } from 'svelte/server';
import { NAVIGATION } from '$settings';
import type { Doc } from '$lib/docs';

export const prerender = true;

interface Module {
	default?: any;
	metadata?: {
		title: string;
		description: string;
	};
}

export async function GET() {
	const modules = import.meta.glob('$lib/markdown/*/*.md', { eager: true });
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
			const module = modules[`/src/lib/markdown/${folder}/${file_name}.md`] as Module;

			data.mdTitle = module?.metadata?.title;
			data.mdDescription = module?.metadata?.description;
			if (module?.default) {
				const content = render(module.default).body.replace(/<\/?[^>]+(>|$)/g, '');
				if (content) data.mdContent = content;
			}

			docs.push(data);
		});
	});

	return json(docs);
}
