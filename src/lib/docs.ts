import type { MdFm } from '$settings';
import type { Component } from 'svelte';
import { resolve } from '$app/paths';

/**
 * Interface for the base settings of the documentation site to be set in the `doc.config.ts` file.
 */
export interface BaseSettings {
	/**
	 * Style of the links in the navigation sidebar.
	 * - "button": Links are styled as buttons, similar to schadcn's documentation site.
	 * - "left-border": Links are styled with a left border, similar to the tailwind's documentation site.
	 * - "custom": Links are styled as user defined style.
	 */
	NAV_STYLE: 'button' | 'left-border' | 'custom';
	/**
	 * Placement location of the search bar.
	 * - "sidebar": Search bar is placed at the top of the navigation sidebar.
	 * - "header": Search bar is placed at in the page header.
	 */
	SEARCH_BAR_LOCATION: 'sidebar' | 'header';
	/**
	 * Whether or not the groups in the navigation sidebar should be collapsible.
	 */
	COLLAPSIBLE_NAV_GROUPS: boolean;
	/**
	 * The company name used in the footer of the page.
	 */
	COMPANY_NAME?: string;
	/**
	 * Specify a route to redirect to instead of the main page. For example `/docs` could be the main route.
	 */
	REDIRECT_URL?: string;
	/**
	 * The URL to the GitHub repository for the documentation.
	 */
	GITHUB_URL?: string;
}

/**
 * Interface describing the properties of a navigation item to be shown in the navigation sidebar.
 */
export interface NavItem {
	/**
	 * The text displayed in the navigation sidebar.
	 */
	title: string;
	/**
	 * The icon displayed in front of the title in the navigation sidebar.
	 */
	icon?: Component;
	/**
	 * The link that the navigation item points to.
	 */
	href?: string;
}

/**
 * Optional parameters to override the default properties of the group.
 */
type NavGroupParams = Partial<Omit<NavGroup, 'items' | 'group' | 'Items'>>;

/**
 * Class representing a group of navigation items with changable paramaters.
 */
export class NavGroup {
	/**
	 * The name of the group. This is used to categorize navigation items.\
	 * - If `show` is enabled, this group text is displayed in the navigation sidebar.
	 * - If `groupHref` is enabled, this group name is used in the link.
	 */
	group: string;
	/**
	 * The corresponding markdown folder location for the group.\
	 * This defaults to `$lib/markdown/{group}` but the {group} can be overridden in the constructor.
	 */
	folder: string;
	/**
	 * Determines if the group text will be shown in the navigation sidebar.\
	 * This defaults to `true` but can be overridden in the constructor.
	 */
	show: boolean;
	/**
	 * Determines if the group will name will used in the link.\
	 * This defaults to `true` but can be overridden in the constructor.
	 * - If `true`, the link will be formated as `/docs/{group}/{title}`.
	 * - If `false`, the link will be formated as `/docs/{title}`.
	 */
	groupHref: boolean;
	/**
	 * A list of all the {@link NavItem} links associated with this group.
	 */
	items: NavItem[] = [];

	/**
	 * Constructer for the NavGroup class.
	 * @param groupName - The name of the group.
	 * @param params - {@link NavGroupParams}
	 */
	constructor(groupName: string, params?: NavGroupParams) {
		this.group = groupName;
		this.folder = params?.folder ?? groupName.replaceAll(' ', '-').toLowerCase();
		this.show = params?.show ?? true;
		this.groupHref = params?.groupHref ?? true;
	}

	/**
	 * Function to create or add nav items.
	 * @param args - A variable number of {@link NavItem} objects to be added to the group.\
	 * Leave empty to initialize the items automatically by reading the markdown folder associated.
	 */
	Items(...args: NavItem[]) {
		// if there are no items, then initialize from markdown files
		if (args.length <= 0) {
			// get all markdown files
			const glob = import.meta.glob(`/src/lib/markdown/*/*.md`, { eager: true, query: 'raw' });

			// get only the keys (file paths)
			const paths = Object.keys(glob);

			// return all the markdown files for that specific group
			args = paths.flatMap((path: string) => {
				// clean the path to get just the `group/filename`
				const cleanedPath = path.replace('/src/lib/markdown/', '').replace('.md', '');
				const [group, title] = cleanedPath.split('/');

				// if the group folder does not equal the folder name, return nothing
				if (group !== this.folder) return [];

				// capatalize first letters of the title since folders mostly likely are not capatalized
				// for example `quick-start` should be `Quick Start`
				const formatedTitle = title
					.split('-')
					.map((t) => t.charAt(0).toUpperCase() + t.slice(1))
					.join(' ');

				return { title: formatedTitle };
			});
		}

		// set the hrefs if not entered
		args.forEach((arg) => {
			// ignore if the href was manually entered in the settings
			if (arg.href) return;

			// create the slug based off of groupHref setting
			const slug: string = (this.groupHref ? `${this.group}/` : '') + arg.title;
			// create and set the full href
			arg.href = `/docs/${slug}`.replaceAll(' ', '-').toLowerCase();
		});

		// set the class items and these arg items
		this.items = args;

		// return self to ensure navigation settings still is this class
		return this;
	}
}

/**
 * Helper function to create {@link NavGroup NavGroups} quicker.
 */
export function Group(groupName: string, params?: NavGroupParams): NavGroup {
	return new NavGroup(groupName, params);
}

/**
 * Item to be used in the {@link NavMap}.
 */
export class NavMapItem {
	group: string;
	title: string;
	folder: string;
	icon?: Component;

	markdown?: Markdown;

	prev?: string;
	next?: string;

	constructor(g: string, t: string, f: string, i: Component | undefined, docData: Doc) {
		this.group = g;
		this.title = t;
		this.folder = f;
		this.icon = i;
		this.markdown = docData.markdown;
	}
}

export async function getMarkdownText(folder: string, title: string): Promise<string> {
	const fileName = title.toLowerCase().replaceAll(' ', '-');
	const md = await import(`$lib/markdown/${folder}/${fileName}.md?raw`);
	return md.default;
}

export async function getMarkdownComponent(folder: string, title: string) {
	const fileName = title.toLowerCase().replaceAll(' ', '-');
	const md = await import(`$lib/markdown/${folder}/${fileName}.md`);
	return { component: md.default, metadata: md.metadata };
}

/**
 * Map of all the individual navigation items.\
 * This is required for next/previous links in the page, as well as referencing the item based off of the URL pathname.
 */
export const NavMap: Map<string, NavMapItem> = new Map();

/**
 * Initializes the {@link NavMap} based off of the {@link NavGroup} list defined in the `doc.config.ts` file.
 */
export function loadNavMap(NAVIGATION: NavGroup[], docData: Doc[]) {
	let index: number = 0;

	NAVIGATION.forEach((group) => {
		group.items.forEach((item) => {
			const navMapItem: NavMapItem = new NavMapItem(
				group.group,
				item.title,
				group.folder,
				item.icon,
				docData[index]
			);
			NavMap.set(item.href as string, navMapItem);
			index += 1;
		});
	});

	let previousMapPair: [string, NavMapItem] | null = null;

	for (const pair of NavMap) {
		if (previousMapPair) {
			const [currentKey, currentMapItem] = pair;
			const [previousKey, previousMapItem] = previousMapPair;

			previousMapItem.next = currentKey;
			currentMapItem.prev = previousKey;
		}
		previousMapPair = pair;
	}
}

export type Doc = {
	group: string;
	title: string;
	href: string;
	markdown?: Markdown;
};

export type Markdown = MdFm & {
	content?: string;
};
