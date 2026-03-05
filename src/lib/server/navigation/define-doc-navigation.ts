import type { Pathname } from '$app/types';

type Icon = {
	/**
	 * The icon to display next to the title of a tab, group, or page.
	 * If the string matches an icon type, the icon Component will be rendered.
	 */
	icon?: string;
};

/**
 * Array of pages that can include 'loadRest' as the last element.
 * 'loadRest' will automatically load remaining markdown files from the filesystem.
 * If 'loadRest' is used, it MUST be the last item in the array and can only appear once.
 */
export type PageItems = DocPage[] | readonly [...DocPage[], 'loadRest'];

export type DocPage = {
	/**
	 * The name of the page. This is displayed in the navigation sidebar.
	 */
	title: string;
	/**
	 * The href of the page. This defaults to being created from the page title if not defined.
	 */
	href?: Pathname;
	/**
	 * The corresponding markdown file location for the page.\
	 * This defaults to `$lib/docs/markdown/{tabTitle?}/{groupTitle?}/{pageTitle}.md` but can be overridden.
	 *
	 * Note that `tabTitle?` and `groupTitle?` are optional and will only be included if a tab or group is defined.
	 */
	fileName?: string;
	/**
	 * Determines if this page is private and requires authentication.
	 * If not explicitly set, inherits the privacy setting from its parent group or tab.
	 * An explicit value at the page level overrides parent settings.
	 */
	private?: boolean;
} & Icon;

export type DocGroup = {
	/**
	 * The name of the group. This is used to categorize navigation items.
	 * - If `showTitle` is `false`, this group text will not be displayed in the navigation sidebar.
	 * - If `combineHref` is `false`, this group name will not be added to the url path of a page.
	 */
	title: string;
	/**
	 * The corresponding markdown folder location for the group.\
	 * This defaults to `$lib/docs/markdown/{tabTitle?}/{groupTitle}` but can be overridden.
	 *
	 * Note that `tabTitle?` is optional and will only be included if a tab is defined.
	 */
	folderPath?: string;
	/**
	 * Determines if the group title will be shown in the navigation sidebar.\
	 * This defaults to `true` but can be overridden.
	 */
	showTitle?: boolean;
	/**
	 * Determines if the group can be collapsed in the navigation sidebar.\
	 * This defaults to `true` but can be overridden.
	 */
	collapsible?: boolean;
	/**
	 * Determines if the group title will name will used in the link.\
	 * This defaults to `true` but can be overridden.
	 * - If `true`, the link will be formated as `/docs/{tabTitle?}/{groupTitle}/{pageTitle}`.
	 * - If `false`, the link will be formated as `/docs//{tabTitle?}/{pageTitle}`.
	 *
	 * Note that `tabTitle?` is optional and will only be included if a tab is defined.
	 */
	combineHref?: boolean;
	/**
	 * A list of all pages to include in the group.
	 * - If `"auto"`, the pages will be automatically generated from the markdown files in the group folder defined by the `folderPath`.
	 * - Can include `'loadRest'` as the last element to load remaining markdown files from the filesystem.
	 */
	pages: PageItems | 'auto';
	/**
	 * Determines if this group and its pages are private and require authentication.
	 * If not explicitly set, inherits the privacy setting from its parent tab.
	 * An explicit value at the group level overrides the parent tab setting and can be overridden by page-level settings.
	 */
	private?: boolean;
} & Icon;

export type DocTab = {
	/**
	 * The name of the tab. This is displayed in the header.
	 */
	title: string;
	/**
	 * The corresponding markdown folder location for the tab.\
	 * This defaults to `$lib/docs/markdown/{tabTitle}` but can be overridden.
	 */
	folderPath?: string;
	/**
	 * Determines if the tab title will name will used in the link.\
	 * This defaults to `true` but can be overridden.
	 * - If `true`, the link will be formated as `/docs/{tabTitle}/{groupTitle?}/{pageTitle}`.
	 * - If `false`, the link will be formated as `/docs/{groupTitle?}/{pageTitle}`.
	 *
	 * Note that `groupTitle?` is optional and will only be included if a group is defined.
	 */
	combineHref?: boolean;
	/**
	 * Determines if this tab and its groups/pages are private and require authentication.
	 * An explicit value at this level can be overridden by group-level or page-level settings.
	 */
	private?: boolean;
} & (
	| { groups: DocGroup[] | 'auto'; pages?: never } // If groups exist, pages cannot
	| { pages: PageItems | 'auto'; groups?: never } // If pages exist, groups cannot
) &
	Icon;

/**
 * The structure of the navigation settings for the documentation site.
 * This ensures that only one of the three properties (`tabs`, `groups`, or `pages`) can be defined at a time.
 */
export type DocNavigationConfig =
	| { tabNextPrev?: boolean; tabs: DocTab[] | 'auto'; groups?: never; pages?: never }
	| { groups: DocGroup[] | 'auto'; tabs?: never; pages?: never; tabNextPrev?: never }
	| { pages: DocPage[] | 'auto'; tabs?: never; groups?: never; tabNextPrev?: never };

/**
 * Validates that 'loadRest' appears at most once and only as the last item in an array.
 * @throws Error if validation fails
 */
export function validatePageItems(pages: PageItems | 'auto' | undefined): void {
	if (!pages || pages === 'auto' || typeof pages === 'string') {
		return;
	}

	let loadRestCount = 0;
	let loadRestIndex = -1;

	for (let i = 0; i < pages.length; i++) {
		if (pages[i] === 'loadRest') {
			loadRestCount++;
			loadRestIndex = i;
		}
	}

	if (loadRestCount > 1) {
		throw new Error("'loadRest' can only appear once in pages array");
	}

	if (loadRestCount === 1 && loadRestIndex !== pages.length - 1) {
		throw new Error("'loadRest' must be the last item in pages array");
	}
}

function validateTabConfig(tab: DocTab): void {
	if ('pages' in tab) {
		validatePageItems(tab.pages);
	}
	if ('groups' in tab && Array.isArray(tab.groups)) {
		for (const group of tab.groups) {
			validatePageItems(group.pages);
		}
	}
}

function validateTabsConfig(tabs: DocTab[] | 'auto' | undefined): void {
	if (tabs && Array.isArray(tabs)) {
		for (const tab of tabs) {
			validateTabConfig(tab);
		}
	}
}

function validateGroupsConfig(groups: DocGroup[] | 'auto' | undefined): void {
	if (groups && Array.isArray(groups)) {
		for (const group of groups) {
			validatePageItems(group.pages);
		}
	}
}

export function defineDocNavigation(config: DocNavigationConfig): DocNavigationConfig {
	if ('tabs' in config) {
		validateTabsConfig(config.tabs);
	}

	if ('groups' in config) {
		validateGroupsConfig(config.groups);
	}

	if ('pages' in config) {
		validatePageItems(config.pages);
	}

	return config;
}
