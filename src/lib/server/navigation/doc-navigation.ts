import { defineDocNavigation } from './define-doc-navigation';

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
					showTitle: true,
					combineHref: false,
					pages: [
						{
							title: 'Public Example',
							icon: 'book-open-check',
							href: '/docs',
							fileName: 'public-example.md'
						},
						{ title: 'Private Example', icon: 'rocket', fileName: 'private-example.md' }
					]
				}
			]
		}
	]
});

export default docNavigationConfig;
