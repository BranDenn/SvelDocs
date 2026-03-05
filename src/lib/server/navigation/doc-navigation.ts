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
					private: true,
					pages: [
						{
							title: 'Public Example',
							icon: 'book-open-check',
							href: '/docs',
							fileName: 'public-example.md'
						},
						{ 
							title: 'Private Example', 
							icon: 'rocket', 
							fileName: 'private-example.md',
						}
					]
				}
			]
		},
		{
			title: 'Examples',
			icon: 'code',
			pages: 'auto'
		}
	]
});

export default docNavigationConfig;
