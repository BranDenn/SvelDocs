import { type Component } from 'svelte';
import type { ResolvedPathname } from '$app/types';
import type { DocTab, DocGroup, DocPage } from './doc-navigation';
import config from './doc-navigation.config.server';

type Page = {
	title: string;
	group?: string;
	tab?: string;
	icon?: string;
	prev?: ResolvedPathname;
	next?: ResolvedPathname;
};

type Group = {
	title: string;
	icon?: string;
	pageHrefs: ResolvedPathname[];
};

type Tab = {
	title: string;
	icon?: string;
	href?: ResolvedPathname;
};

function getMarkdown() {
	const moduleLoaders = import.meta.glob<{ default: Component; metadata: any }>(
		'/src/lib/docs/markdown/**/*.md',
		{ eager: false }
	);

	// Create a single mapping where each file path exposes a module loader and a raw loader
	const files = Object.fromEntries(
		Object.keys(moduleLoaders).map((path) => {
			const load = moduleLoaders[path] as () => Promise<{ default: Component; metadata: any }>;
			const loadRaw = () =>
				import(/* @vite-ignore */ `${path}?raw`).then((m: { default: string }) => m.default);
			const newPath = path.replace('/src/lib/docs/markdown/', '').replace('.md', '');
			return [newPath, { load, loadRaw }];
		})
	) as Record<
		string,
		{
			load: () => Promise<{ default: Component; metadata: any }>;
			loadRaw: () => Promise<string>;
		}
	>;

	return files;
}

const markdown = getMarkdown();

function getTabs(tabs: DocTab[] | 'auto') {
	if (tabs === 'auto') {
		return [];
	}

	for (const tab of tabs) {
		if ('groups' in tab) {
			// this.loadGroups(tab.groups)
			continue;
		}

		// this.loadPages(tab.pages)
	}
}

function getGroups(groups: DocGroup[] | 'auto', tab?: DocTab) {
	if (groups === 'auto') {
		return [];
	}
}

function getPages(pages: DocPage[] | 'auto', group?: DocGroup, tab?: DocTab): Page[] {
	if (pages === 'auto') {
		return [];
	}

	return pages.map((page) => {
		if (page.href) return page;

		let slug: string = page.title;
		if (group?.combineHref) slug = `${group.title}/${slug}`;
		if (tab?.combineHref) slug = `${tab.title}/${slug}`;
		const href = `/docs/${slug}`.replaceAll(' ', '-').toLowerCase();

		return { href, title: page.title }; // will need to fix this to include next and prev between tabs
	});
}

export function generateDocs(): { tabs?: Tab[]; groups?: Group[]; pages?: Page[] } {
	if ('tabs' in config) {
		const tabs = getTabs(config.tabs!);

		//     this.tabs = config.tabs!.map(({ title, icon }) => {
		//         return { title, icon };
		//     });

		//     for (const tab of config.tabs!) {
		//         if ('groups' in tab) {
		//             // this.loadGroups(tab.groups)
		//             continue;
		//         }

		//         // this.loadPages(tab.pages)
		//     }

		//     return;
	}

	return {};
}
