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
					icon: 'goal',
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
});

// Group-only (no tabs) example:
// Uncomment this block and comment out the tabs-based block above to test.

// const docNavigationConfig = defineDocNavigation<Roles>({
// 	groups: [
// 		{
// 			title: 'Getting Started',
// 			folderPath: 'documentation/getting-started',
// 			showTitle: false,
// 			combineHref: false,
// 			pages: [
// 				{ title: 'Introduction', icon: 'book-open-check', href: '/docs' },
// 				{ title: 'Quick Start', icon: 'rocket' }
// 			]
// 		},
// 		{
// 			title: 'Configuration',
// 			folderPath: 'documentation/configuration',
// 			icon: 'cog',
// 			pages: 'auto'
// 		},
// 		{
// 			title: 'Miscellaneous',
// 			folderPath: 'documentation/miscellaneous',
// 			icon: 'dices',
// 			pages: 'auto'
// 		},
// 		{
// 			title: 'Guides',
// 			folderPath: 'guides',
// 			icon: 'book',
// 			pages: 'auto'
// 		}
// 	]
// });

// Page-only (no tabs, no groups) example:
// Uncomment this block and comment out the tabs-based block above to test.

// const docNavigationConfig = defineDocNavigation<Roles>({
// 	pages: [
// 		{ title: 'Introduction', href: '/docs', fileName: 'documentation/getting-started/introduction.md' },
// 		{ title: 'Quick Start', href: '/docs/quick-start', fileName: 'documentation/getting-started/quick-start.md' },
// 		{ title: 'Markdown', href: '/docs/configuration/markdown', fileName: 'documentation/configuration/markdown.mdx' },
// 		{ title: 'Checklist', href: '/docs/miscellaneous/checklist', fileName: 'documentation/miscellaneous/checklist.md' },
// 		{ title: 'Markdown Syntax', href: '/docs/miscellaneous/markdown-syntax', fileName: 'documentation/miscellaneous/markdown-syntax.mdx' },
// 		{ title: 'Auth', href: '/docs/guides/auth', fileName: 'guides/auth.md' },
// 		{ title: 'Server Side Rendering', href: '/docs/guides/server-side-rendering', fileName: 'guides/server-side-rendering.md' }
// 	]
// });

export default docNavigationConfig;
