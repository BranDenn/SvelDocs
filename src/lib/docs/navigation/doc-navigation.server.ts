import { type Component } from 'svelte';
import type { ResolvedPathname } from '$app/types';
import type { DocTab, DocGroup, DocPage } from './doc-navigation';
import type { Group, Page, Params } from './doc-navigation-context.svelte';
import config from './doc-navigation.config.server';

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

function slugify(s: string) {
	return s.replaceAll(' ', '-').toLowerCase();
}

function getTitle(s: string) {
	return s
		.split('-')
		.map((t) => (t.charAt(0) || '').toUpperCase() + t.slice(1))
		.join(' ');
}

export function generateDocs(): Params {
	// Pages only implementation (no tabs / groups)
	if ('pages' in config) {
		if (!config.pages) return {};

		let pages: Page[];

		if (config.pages === 'auto') {
			const mdKeys = Object.keys(markdown);
			pages = mdKeys.flatMap((key) => {
				const filename = key.split('/').at(-1);
				if (!filename) return [];

				const title = getTitle(filename);
				const href = `/docs/${slugify(title)}` as ResolvedPathname;
				return { href, title };
			});
		} else {
			pages = config.pages.map((p) => {
				const href = (p.href ?? `/docs/${slugify(p.title)}`) as ResolvedPathname;
				return { href, title: p.title, icon: p.icon };
			});
		}

		pages.sort((a, b) => a.title.localeCompare(b.title));

		// Set prev/next links across the list
		for (let i = 0; i < pages.length; i++) {
			pages[i].prev = i > 0 ? pages[i - 1].href : undefined;
			pages[i].next = i < pages.length - 1 ? pages[i + 1].href : undefined;
		}

		return { pages };
	}

	// Groups only implementation (no tabs, no auto for groups yet)
	if ('groups' in config) {
		if (!config.groups) return {};

		const groups: Group[] = [];
		const pages: Page[] = [];

		if (config.groups === 'auto') {
			return {};
		}

		for (const group of config.groups) {
			const groupSlug = slugify(group.title);
			const pageHrefs: ResolvedPathname[] = [];
			const folderName = group.folderPath ?? slugify(group.title);

			if (group.pages === 'auto') {
				const mdKeys = Object.keys(markdown).filter((key) => {
					const groupname = key.split('/').at(-2);
					return groupname === folderName;
				});

				mdKeys.forEach((key) => {
					const filename = key.split('/').at(-1);
					if (!filename) return;

					const pageTitle = getTitle(filename);
					const href = `/docs/${slugify(group.title)}/${slugify(pageTitle)}` as ResolvedPathname;

					pages.push({ href, title: pageTitle, group: group.title });
					pageHrefs.push(href);
				});
			} else {
				for (const page of group.pages) {
					const pageSlug = slugify(page.title);
					const prefix = group.combineHref === false ? '' : `${groupSlug}/`;
					const href = (page.href ?? `/docs/${prefix}${pageSlug}`) as ResolvedPathname;

					pages.push({ href, title: page.title, group: group.title, icon: page.icon });
					pageHrefs.push(href);
				}
			}

			groups.push({ title: group.title, icon: group.icon, pageHrefs, show: group.showTitle });
		}

		// Set prev/next links across the list
		for (let i = 0; i < pages.length; i++) {
			pages[i].prev = i > 0 ? pages[i - 1].href : undefined;
			pages[i].next = i < pages.length - 1 ? pages[i + 1].href : undefined;
		}

		return { groups, pages };
	}

	// Not a pages or groups configuration: return empty for now
	return {};
}
