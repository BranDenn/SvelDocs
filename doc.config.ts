import { Group, type NavGroup, type BaseSettings } from '$lib/docs';
import BookOpenCheck from '@lucide/svelte/icons/book-open-check';
import Rocket from '@lucide/svelte/icons/rocket';
import Settings from '@lucide/svelte/icons/settings-2';

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
export const SETTINGS: BaseSettings = {
	NAV_STYLE: 'left-border',
	SEARCH_BAR_LOCATION: 'sidebar',
	COLLAPSIBLE_NAV_GROUPS: true,
	REDIRECT_URL: '/docs'
};

// --- CHANGEABLE NAVIGATION ---
/**
 * This makes it simple to configure the documentation structure.\
 * This is exported to other code files such as the left sidebar to render the groups and items.\
 * This also handles routing. By default things are handles automatically, but these can be overridden.
 * @see {@link NavGroup} for more information
 */
export const NAVIGATION: NavGroup[] = [
	Group('Getting Started', { show: false, group_href: false }).Items(
		{ title: 'Introduction', icon: BookOpenCheck, href: SETTINGS.REDIRECT_URL },
		{ title: 'Quick Start', icon: Rocket },
		{ title: 'Configuration', icon: Settings }
	),
	Group('Customization').Items(),
	Group('Features').Items()
];
