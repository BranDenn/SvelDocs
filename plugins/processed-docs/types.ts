import type { DocPrivateAccess } from '../../src/lib/server/docs/navigation/define-doc-navigation';
import type {
	DocNavigationParams,
	NavigationGroup,
	NavigationPage,
	NavigationTab
} from '../../src/lib/doc-navigation-context.svelte';
import type { MarkdownAstResult } from './markdown-to-ast';

export type DocSearchItem = {
	href: string;
	title: string;
	description: string;
	keywords?: string[];
	icon?: string;
};

export type ManifestNavigationPage = NavigationPage & {
	slug: string;
};

export type DocsNavigationMaps = {
	tabs: Record<number, NavigationTab>;
	groups: Record<number, NavigationGroup>;
	pages: Record<string, ManifestNavigationPage>;
};

export type BuiltDocRecord = {
	slug: string;
	filepath: string;
	title: string;
	private: DocPrivateAccess;
	icon?: string;
	markdown: MarkdownAstResult;
};

export type DocsManifestData = {
	navigation: DocsNavigationMaps;
	pageData: Map<string, BuiltDocRecord>;
};

export type DocLayoutData = {
	navigation: DocNavigationParams;
	searchGroups: Array<{
		title: string;
		icon?: string;
		items: DocSearchItem[];
	}>;
};
