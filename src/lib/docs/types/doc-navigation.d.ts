import type { Pathname } from '$app/types';
import type { Component } from 'svelte';

type Icon = {
	/**
	 * The icon to display next to the title of a tab, group, or page.
	 * A svelte component can be added as the icon, such as a lucide icon.
	 * A string can also be used such as an emoji.
	 */
	icon?: Component | string;
};

type Page = {
	/**
	 * The name of the page. This is displayed in the navigation sidebar.
	 */
	title: string;
	/**
	 * The href of the page. This defaults to being created from the page title if not defined.
	 */
	href?: Pathname;
} & Icon;

type Group = {
	/**
	 * The name of the group. This is used to categorize navigation items.
	 * - If `showTitle` is `false`, this group text will not be displayed in the navigation sidebar.
	 * - If `combineHref` is `false`, this group name will not be added to the url path of a page.
	 */
	title: string;
	/**
	 * The corresponding markdown folder location for the group.\
	 * This defaults to `$lib/docs/markdown/{groupTitle}` but can be overridden.
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
	 * - If `true`, the link will be formated as `/docs/{groupTitle}/{pageTitle}`.
	 * - If `false`, the link will be formated as `/docs/{pageTitle}`.
	 */
	combineHref?: boolean;
	/**
	 * A list of all pages to include in the group.
	 * - If `"auto"`, the pages will be automatically generated from the markdown files in the group folder defined by the `folderPath`.
	 */
	pages: Page[] | 'auto';
} & Icon;

type Tab = {
	/**
	 * The name of the tab. This is displayed in the header.
	 */
	title: string;
} & (
	| { groups: Group[] | 'auto'; pages?: never } // If groups exist, pages cannot
	| { pages: Page[]; groups?: never } // If pages exist, groups cannot
) &
	Icon;

/**
 * The structure of the navigation settings for the documentation site.
 * This ensures that only one of the three properties (`tabs`, `groups`, or `pages`) can be defined at a time.
 */
export type DocNavigationSettings =
	| { tabs: Tab[]; groups?: never; pages?: never }
	| { groups: Group[]; tabs?: never; pages?: never }
	| { pages: Page[]; tabs?: never; groups?: never };

// Treat this file as a module
export {};
