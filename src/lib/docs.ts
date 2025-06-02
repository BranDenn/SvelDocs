import type { Component } from "svelte";

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
    NAV_STYLE: "button" | "left-border" | "custom",
	/**
	 * Placement location of the search bar.
	 * - "sidebar": Search bar is placed at the top of the navigation sidebar.
	 * - "header": Search bar is placed at in the page header.
	 */
    SEARCH_BAR_LOCATION : "sidebar" | "header",
	/**
	 * Whether or not the groups in the navigation sidebar should be collapsible when pressed.
	 */
    COLLAPSIBLE_NAV_GROUPS : boolean;
	/**
	 * The company name used in the footer of the page.
	 */
	COMPANY_NAME?: string;
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
type NavGroupParams = Partial<Omit<NavGroup, "items" | "group" | "Items">>;

/**
* Class representing a group of navigation items with changable paramaters.
*/
export class NavGroup {
	/**
	 * The name of the group. This is used to categorize navigation items. 
	 * - If `show` is enabled, this group text is displayed in the navigation sidebar.
	 * - If `group_href` is enabled, this group name is used in the link.
	 */
	group: string;
	/**
	 * The corresponding markdown folder location for the group.
	 * This defaults to `$lib/markdown/{group}` but the {group} can be overridden in the constructor.
	 */
	folder: string;
	/**
	 * Determines if the group text will be shown in the navigation sidebar.
	 * This defaults to `true` but can be overridden in the constructor.
	 */
	show: boolean;
	/**
	 * Determines if the group will name will used in the link.
	 * This defaults to `true` but can be overridden in the constructor. 
	 * - If `true`, the link will be formated as `/docs/{group}/{title}`.
	 * - If `false`, the link will be formated as `/docs/{title}`.
	 */
	group_href: boolean;
	/**
	 * A list of all the {@link NavItem} links associated with this group.
	 */
	items: NavItem[] = [];

	/**
	 * Constructer for the NavGroup class.
	 * @param g - The name of the group.
	 * @param params - {@link NavGroupParams}
	 */
	constructor(g: string, params?: NavGroupParams) {
		this.group = g;
		this.folder = params?.folder ?? g.replaceAll(' ', '-').toLowerCase();
		this.show = params?.show ?? true;
		this.group_href = params?.group_href ?? true;
	}

	/**
	 * Function to create or add nav items.
	 * @param args - A variable number of {@link NavItem} objects to be added to the group. Leave empty to initialize the items automatically by reading the markdown folder associated.
	 */
	Items(...args: NavItem[]) { 
		if (args.length <= 0) {
			const glob = import.meta.glob(`$lib/markdown/*/*.md`, { eager: true });
			const paths = Object.keys(glob);
			
			args = paths.flatMap((path: string) => {
				const cleanedPath = path.replace('/src/lib/markdown/', '').replace('.md', '');
				const [group, title] = cleanedPath.split('/');
				if (group !== this.folder) return [];
				const titleParts = title.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1));
				return { title: titleParts.join(' ')} as NavItem;
			});
		}

		args.forEach(arg => {
			const slug : string = (this.group_href ? `${this.group}/` : '') + arg.title
			const href : string = `/docs/${slug}`.replaceAll(' ', '-').toLowerCase();

			arg.href = arg.href ?? href
		});

		this.items = args 

		return this
	}
}

/**
* Helper function to quicker create {@link NavGroup NavGroups}.
*/
export function Group(g: string, params?: NavGroupParams) : NavGroup {
	return new NavGroup(g, params)
}

/**
* Class to be used in the {@link NavMap}.
*/
export class NavMapItem {
	group: string;
	title: string;
	prev?: string;
	next?: string;

	constructor(g: string, title: string) {
		this.group = g;
		this.title = title;
	}
}

/**
* Map of all the individual navigation items. This is required for next/previous links in the page, as well as referencing the item based off of the URL pathname.
*/
export const NavMap: Map<string, NavMapItem> = new Map();

/**
* Initializes the {@link NavMap} based off of the {@link NavGroup} list defined in the `doc.config.ts` file.
*/
export function loadNavMap(NAVIGATION: NavGroup[]) {
	NAVIGATION.forEach(group => {
		group.items.forEach(item => {
			NavMap.set(item.href as string, new NavMapItem(group.group, item.title));
		})
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