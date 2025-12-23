import type { Pathname } from '$app/types';
import type { Component } from 'svelte';

type Icon = {
	/**
	 * The icon to display next to the title of a tab, group, or page.
	 * If the string matches an icon type, the icon Component will be rendered.
	 */
	icon?: string;
};

export type DocPage = {
	/**
	 * The name of the page. This is displayed in the navigation sidebar.
	 */
	title: string;
	/**
	 * The href of the page. This defaults to being created from the page title if not defined.
	 */
	href?: Pathname;
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
	 */
	pages: DocPage[] | 'auto';
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
} & (
	| { groups: DocGroup[] | 'auto'; pages?: never } // If groups exist, pages cannot
	| { pages: DocPage[] | 'auto'; groups?: never } // If pages exist, groups cannot
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

// Treat this file as a module
export {};
