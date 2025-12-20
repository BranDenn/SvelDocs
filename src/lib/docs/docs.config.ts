import { Group, type NavGroup } from '$lib/docs';
import type { DocSettings } from './types/doc-settings';
import type { DocNavigationSettings } from './types/doc-navigation';
import BookOpenCheckIcon from '@lucide/svelte/icons/book-open-check';
import RocketIcon from '@lucide/svelte/icons/rocket';
import CogIcon from '@lucide/svelte/icons/cog';
import ComponentIcon from '@lucide/svelte/icons/component';
import DicesIcon from '@lucide/svelte/icons/dices';

// --- MARKDOWN FRONTMATTER ---
/**
 * This makes it simple to change the type safety parameters for the markdown files.\
 * This is exported to other code files that read markdown files to ensure the type safety.
 */
export interface MdFm {
	title?: string;
	description?: string;
}

// --- CHANGABLE SETTINGS ---
/**
 * This makes it simple to change the basic settings on the site.\
 * This is exported to other code files that determine what the setting changes.
 */
export const SETTINGS: DocSettings = {
	NAV_STYLE: 'button',
	SEARCH_BAR_LOCATION: 'sidebar',
	COLLAPSIBLE_NAV_GROUPS: true,
	COMPANY_NAME: 'Your Company Name',
	GITHUB_URL: 'https://github.com/BranDenn/SvelDocs'
	// REDIRECT_URL: '/docs'
};

// --- CHANGEABLE NAVIGATION ---
/**
 * This makes it simple to configure the documentation structure.\
 * This is exported to other code files such as the left sidebar to render the groups and items.\
 * This also handles routing. By default things are handles automatically, but these can be overridden.
 * @see {@link NavGroup} for more information
 */
export const NAVIGATION: NavGroup[] = [
	Group('Getting Started', { show: false, groupHref: false }).Items(
		{ title: 'Introduction', icon: BookOpenCheckIcon, href: '/docs' },
		{ title: 'Quick Start', icon: RocketIcon }
	),
	Group('Configuration', { icon: CogIcon }).Items(),
	Group('Components', { icon: ComponentIcon }).Items(),
	Group('Miscellaneous', { icon: DicesIcon }).Items()
];

export const docNavigation: DocNavigationSettings = {
	tabs: [
		{
			title: 'Overview',
			groups: [
				{
					title: 'Getting Started',
					showTitle: false,
					combineHref: false,
					pages: [
						{ title: 'Introduction', icon: BookOpenCheckIcon, href: '/docs' },
						{ title: 'Quick Start', icon: RocketIcon }
					]
				},
				{
					title: 'Configuration',
					icon: CogIcon,
					pages: 'auto'
				},
				{
					title: 'Components',
					icon: ComponentIcon,
					pages: 'auto'
				},
				{
					title: 'Miscellaneous',
					icon: DicesIcon,
					pages: 'auto'
				}
			]
		}
	]
};
