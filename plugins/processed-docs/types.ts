import type { DocPrivateAccess } from '../../src/lib/docs/server/navigation/define-doc-navigation';
import type {
	DocNavigationParams,
	NavigationGroup,
	NavigationPage,
	NavigationTab
} from '../../src/lib/docs/client/doc-navigation-context.svelte';
import type { MarkdownAstResult } from './markdown-to-ast.js';

export type DocSearchItem = {
	href: string;
	title: string;
	description: string;
	keywords?: string[];
	icon?: string;
};

export type ManifestNavigationPage = NavigationPage & {
	slug: string;
	filepath: string;
	private: DocPrivateAccess | false;
};

export type ManifestDocPage = ManifestNavigationPage & {
	docData: BuiltDocRecord;
};

export type DocsManifestData = {
	tabs: Map<number, Omit<NavigationTab, 'id'>>;
	groups: Map<number, Omit<NavigationGroup, 'id'>>;
	pages: Map<string, ManifestDocPage>;
};

export type BuiltDocRecord = {
	slug: string;
	href: string;
	filepath: string;
	title: string;
	private: DocPrivateAccess;
	icon?: string;
	markdown: MarkdownAstResult;
};

export type DocLayoutData = {
	navigation: DocNavigationParams;
	searchGroups: Array<{
		title: string;
		icon?: string;
		items: DocSearchItem[];
	}>;
};
