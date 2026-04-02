import { error } from '@sveltejs/kit';
import searchJsonData from 'virtual:doc-search-json';
import {
	buildDocLayoutData,
	normalizeRouteSlug
} from '../../../../plugins/processed-docs/layout-data';
import type { BuiltDocRecord } from '../../../../plugins/processed-docs/types';
import type { TOCSeedEntry } from '$ui/table-of-contents';

const temp = searchJsonData;

type AstNode = {
	type?: string;
	tagName?: string;
	value?: unknown;
	properties?: Record<string, unknown>;
	children?: AstNode[];
};

type RawHeading = {
	id: string;
	text: string;
	tagLevel: number;
};

function extractTextFromNode(node: AstNode | undefined): string {
	if (!node) return '';

	const ownValue = typeof node.value === 'string' ? node.value.trim() : '';
	if (!Array.isArray(node.children) || node.children.length === 0) return ownValue;

	const childText = node.children
		.map((child) => extractTextFromNode(child))
		.filter(Boolean)
		.join(' ')
		.trim();

	if (!ownValue) return childText;
	if (!childText) return ownValue;
	return `${ownValue} ${childText}`;
}

function hasIgnoreTocFlag(properties: Record<string, unknown> | undefined): boolean {
	if (!properties) return false;

	const flag =
		properties.dataIgnoreToc ?? properties['data-ignore-toc'] ?? properties.ignoreToc ?? false;

	return flag === true || flag === 'true' || flag === '';
}

function collectHeadingsFromAst(node: AstNode | undefined, headings: RawHeading[]) {
	if (!node) return;

	if (node.type === 'element') {
		const tagName = node.tagName?.toLowerCase() ?? '';
		const headingMatch = /^h([1-6])$/.exec(tagName);

		if (headingMatch && !hasIgnoreTocFlag(node.properties)) {
			const id = node.properties?.id;
			if (typeof id === 'string' && id.trim()) {
				headings.push({
					id: id.trim(),
					text: extractTextFromNode(node),
					tagLevel: Number(headingMatch[1])
				});
			}
		}
	}

	if (Array.isArray(node.children)) {
		for (const child of node.children) {
			collectHeadingsFromAst(child, headings);
		}
	}
}

function extractTocEntries(ast: unknown): TOCSeedEntry[] {
	const headings: RawHeading[] = [];
	collectHeadingsFromAst(ast as AstNode, headings);

	const seenIds = new Set<string>();
	const stack: Array<{ id: string; level: number }> = [];
	const tocEntries: TOCSeedEntry[] = [];

	for (const heading of headings) {
		if (seenIds.has(heading.id)) continue;

		while (stack.length > 0 && heading.tagLevel <= (stack.at(-1)?.level ?? 0)) {
			stack.pop();
		}

		tocEntries.push({
			id: heading.id,
			text: heading.text || heading.id,
			level: stack.length + 1
		});

		seenIds.add(heading.id);
		stack.push({ id: heading.id, level: heading.tagLevel });
	}

	return tocEntries;
}

export function getDocLayoutData(filter: (doc: BuiltDocRecord) => boolean = () => true) {
	return buildDocLayoutData(searchJsonData, filter);
}

export function getPublicDocEntries() {
	const data: BuiltDocRecord[] = [...searchJsonData.pageData.values()];

	const filtered = data.flatMap((doc) => {
		const { private: isPrivate, ...docData } = doc;
		if (isPrivate !== false) return [];
		return [docData];
	});

	return filtered;
}

export function isAllPublic() {
	const allDocs = [...searchJsonData.pageData.values()];
	return allDocs.every((doc) => doc.private === false);
}

export const prerender: true | 'auto' = isAllPublic() ? true : 'auto';

export function getDocsData(slugParam: string): BuiltDocRecord {
	const slug = normalizeRouteSlug(slugParam);
	const data = searchJsonData.pageData.get(slug);

	if (!data) {
		throw error(404, 'Document not found');
	}

	return data;
}

export function getDocPageData(doc: BuiltDocRecord) {
	const ast = doc.markdown.ast;

	if (!ast) {
		throw error(500, 'Document AST was not generated');
	}

	return {
		ast,
		metadata: doc.markdown.metadata ?? {},
		title: doc.title,
		tocEntries: extractTocEntries(ast)
	} as const;
}
