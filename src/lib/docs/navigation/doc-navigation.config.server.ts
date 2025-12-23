import type { DocNavigationConfig } from './doc-navigation';

/**
 * This makes it simple to configure the documentation navigation.
 *
 * This should ideally be in a .server.ts file to ensure it is protected for Server Side Rendering (SSR).\
 * Example cases for Server Side Rendering may include loading dynamic server content or providing auth checks before rendering the documentation navigation.
 *
 * This being in the .server.ts file will work for Static Site Generation (SSG) as well.
 */
const docNavigationConfig: DocNavigationConfig = {
	tabNextPrev: true,
	tabs: [
		{
			title: 'Overview',
			combineHref: false,
			icon: 'flag',
			groups: [
				{
					title: 'Getting Started',
					showTitle: false,
					combineHref: false,
					pages: [
						{ title: 'Introduction', icon: 'book-open-check', href: '/docs' },
						{ title: 'Quick Start', icon: 'rocket' }
					]
				},
				{
					title: 'Configuration',
					icon: 'cog',
					pages: 'auto'
				},
				{
					title: 'Components',
					icon: 'component',
					pages: 'auto'
				},
				{
					title: 'Miscellaneous',
					icon: 'dices',
					pages: 'auto'
				}
			]
		},
		{
			title: 'Guides',
			combineHref: true,
			icon: 'book',
			pages: 'auto'
		}
	]
};

export default docNavigationConfig;
