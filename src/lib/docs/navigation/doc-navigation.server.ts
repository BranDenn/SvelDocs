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
		let href: ResolvedPathname;
		if (page.href) href = page.href;
		else {
			const slugParts: string[] = [];
			if (tab?.combineHref) slugParts.push(tab.title);
			if (group?.combineHref) slugParts.push(group.title);
			slugParts.push(page.title);
			href = `/docs/${slugify(slugParts.join('/'))}` as ResolvedPathname;
		}

		return { href, title: page.title };
	});
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

				const title = filename
					.split('-')
					.map((t) => (t.charAt(0) || '').toUpperCase() + t.slice(1))
					.join(' ');
				const href = `/docs/${slugify(title)}` as ResolvedPathname;
				return { href, title };
			});
		} else {
			pages = config.pages.map((p) => {
				const href = (p.href ?? `/docs/${slugify(p.title)}`) as ResolvedPathname;
				return { href, title: p.title, icon: p.icon };
			});
		}

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

			if (group.pages === 'auto') {
				return {};
			}

			for (const page of group.pages) {
				const pageSlug = slugify(page.title);
				const prefix = group.combineHref === false ? '' : `${groupSlug}/`;
				const href = (page.href ?? `/docs/${prefix}${pageSlug}`) as ResolvedPathname;
				pageHrefs.push(href);
				pages.push({ href, title: page.title, group: group.title, icon: page.icon });
			}

			groups.push({ title: group.title, icon: group.icon, pageHrefs });
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
