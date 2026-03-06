import { defineDocNavigation } from './define-doc-navigation';

// Navigation config defines structure and sidebar presentation
// Markdown frontmatter defines page-specific content and metadata
// This allows different sidebar labels from page titles if needed

const docNavigationConfig = defineDocNavigation({
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
});

export default docNavigationConfig;
