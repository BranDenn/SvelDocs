/**
 * Interface for the base settings of the documentation site to be set in the `doc.config.ts` file.
 */
export interface DocSettings {
	/**
	 * Style of the links in the navigation sidebar.
	 * - "button": Links are styled as buttons, similar to schadcn's documentation site.
	 * - "left-border": Links are styled with a left border, similar to the tailwind's documentation site.
	 * - "custom": Links are styled as user defined style.
	 */
	NAV_STYLE: 'button' | 'left-border';
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

// Treat this file as a module
export {};
