import { error } from '@sveltejs/kit';
import searchJsonData from 'virtual:doc-search-json';
import {
	buildDocLayoutData,
	normalizeRouteSlug
} from '../../../../plugins/processed-docs/layout-data';
import type { BuiltDocRecord } from '../../../../plugins/processed-docs/types';

export function getDocLayoutData(filter: (doc: BuiltDocRecord) => boolean = () => true) {
	return buildDocLayoutData(searchJsonData, filter);
}

export function getPublicDocEntries() {
	const entries: Array<{ slug: string }> = [];

	for (const doc of searchJsonData.getBySlug.values()) {
		if (doc.private === false) {
			entries.push({ slug: doc.slug });
		}
	}

	return entries;
}

export function getDocsData(slugParam: string): BuiltDocRecord {
	const slug = normalizeRouteSlug(slugParam);
	const data = searchJsonData.getBySlug.get(slug);

	if (!data) {
		throw error(404, 'Document not found');
	}

	return data;
}

export function toDocPayload(doc: BuiltDocRecord) {
	const ast = doc.markdown.ast;

	if (!ast) {
		throw error(500, 'Document AST was not generated');
	}

	return {
		ast,
		metadata: doc.markdown.metadata ?? {},
		slug: doc.slug,
		title: doc.title,
		access: doc.private
	} as const;
}
