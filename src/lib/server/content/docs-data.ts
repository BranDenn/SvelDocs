import markdownConfig from '$lib/markdown/markdown.config';

type DocModule = {
	ast?: unknown;
	metadata?: Record<string, unknown>;
	default?: {
		ast?: unknown;
		metadata?: Record<string, unknown>;
	};
};

export type DocData = {
	href: string;
	metadata: Record<string, unknown>;
	ast: unknown;
	content: string;
};

const docModules = import.meta.glob('/content/**/*', {
	eager: true
}) as Partial<Record<string, DocModule>>;

const markdownExtensions = markdownConfig.extensions.map((ext) => ext.toLowerCase());

function isMarkdownModulePath(filePath: string): boolean {
	const lowerPath = filePath.toLowerCase();
	return markdownExtensions.some((ext) => lowerPath.endsWith(ext));
}

function normalizeHrefFromPath(filePath: string): string {
	const relativePath = filePath.replace(/^\/content\//, '');
	const withoutExtension = relativePath.replace(/\.(md|mdx)$/i, '');
	const normalizedPath = withoutExtension.replace(/\/index$/i, '');
	const hrefPath = normalizedPath ? `/docs/${normalizedPath}` : '/docs';

	return hrefPath.replaceAll(/\/+/g, '/');
}

function extractModulePayload(module: DocModule): {
	ast?: unknown;
	metadata: Record<string, unknown>;
} {
	if (module.default && typeof module.default === 'object') {
		return {
			ast: module.default.ast,
			metadata: module.default.metadata ?? {}
		};
	}

	return {
		ast: module.ast,
		metadata: module.metadata ?? {}
	};
}

function extractTextFromAstNode(node: unknown, buffer: string[]): void {
	if (!node || typeof node !== 'object') {
		return;
	}

	const nodeObj = node as Record<string, unknown>;

	if (typeof nodeObj.value === 'string') {
		const value = nodeObj.value.trim();
		if (value) {
			buffer.push(value);
		}
	}

	if (Array.isArray(nodeObj.children)) {
		for (const child of nodeObj.children) {
			extractTextFromAstNode(child, buffer);
		}
	}
}

function extractTextFromAst(ast: unknown): string {
	const buffer: string[] = [];
	extractTextFromAstNode(ast, buffer);
	return buffer.join(' ').replaceAll(/\s+/g, ' ').trim();
}

function createDocsDataByHref(): Map<string, DocData> {
	const docsDataByHref = new Map<string, DocData>();

	for (const [filePath, module] of Object.entries(docModules)) {
		if (!module) {
			continue;
		}

		if (!isMarkdownModulePath(filePath)) {
			continue;
		}

		const { ast, metadata } = extractModulePayload(module);
		if (!ast) {
			continue;
		}

		const href = normalizeHrefFromPath(filePath);
		docsDataByHref.set(href, {
			href,
			metadata,
			ast,
			content: extractTextFromAst(ast)
		});
	}

	return docsDataByHref;
}

export const docsDataByHref = createDocsDataByHref();
