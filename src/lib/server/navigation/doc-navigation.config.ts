import { defineDocNavigation } from './define-doc-navigation';

// The Navigation Config defines how the documentation is loaded and presented.
// The 'auto' option allows for automatic generation based on the file structure, while 'loadRest' can be used to load remaining items after explicitly defined ones.
// You can customize the navigation by defining your own tabs, groups, and pages.
// You can hover over the properties in your IDE to see detailed explanations of each option.

type Roles = 'paidUser' | 'admin';

const docNavigationConfig = defineDocNavigation<Roles>({
	tabNextPrev: true,
	tabs: [
		{
			title: 'Documentation',
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
		},
	]
});

export default docNavigationConfig;
