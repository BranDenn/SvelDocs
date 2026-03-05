import { error } from '@sveltejs/kit';

type DocModule = {
	default?: {
		ast?: unknown;
		metadata?: Record<string, unknown>;
	};
};

type Importer = () => Promise<DocModule>;

const publicDocModules = import.meta.glob('/src/lib/content/**/*.{md,mdx}') as Record<string, Importer>;
const privateDocModules = import.meta.glob('/src/lib/server/content/**/*.{md,mdx}') as Record<
	string,
	Importer
>;

function normalizeSlug(slugParam: string): string {
	const withoutDocsPrefix = slugParam.replace(/^docs\/?/, '').replace(/^\/+|\/+$/g, '');
	return withoutDocsPrefix || 'index';
}

function getCandidates(basePath: string) {
	return [
		`${basePath}.md`,
		`${basePath}.mdx`,
		`${basePath}/index.md`,
		`${basePath}/index.mdx`
	];
}

function routeSlugFromPath(filePath: string, rootPrefix: '/src/lib/content/' | '/src/lib/server/content/') {
	const withoutPrefix = filePath.replace(rootPrefix, '').replace(/\.(md|mdx)$/i, '');
	const normalized = withoutPrefix.replace(/\/index$/i, '');
	return normalized ? `docs/${normalized}` : 'docs';
}

function findDocImport(slugParam: string) {
	const normalized = normalizeSlug(slugParam);
	const publicRoot = `/src/lib/content/${normalized}`;
	const privateRoot = `/src/lib/server/content/${normalized}`;

	for (const candidate of getCandidates(publicRoot)) {
		const importer = publicDocModules[candidate];
		if (importer) {
			return { importer, access: 'public' as const, slug: normalized };
		}
	}

	for (const candidate of getCandidates(privateRoot)) {
		const importer = privateDocModules[candidate];
		if (importer) {
			return { importer, access: 'private' as const, slug: normalized };
		}
	}

	return null;
}

function isAuthenticated(locals: unknown): boolean {
	if (!locals || typeof locals !== 'object') return false;
	return Boolean((locals as Record<string, unknown>).user);
}

export function getPublicDocEntries() {
	const slugs = Object.keys(publicDocModules).map((path) =>
		routeSlugFromPath(path, '/src/lib/content/')
	);

	return Array.from(new Set(slugs)).map((slug) => ({ slug }));
}

export async function loadDocAst(slugParam: string, locals: unknown) {
	const match = findDocImport(slugParam);

	if (!match) {
		throw error(404, 'Document not found');
	}

	if (match.access === 'private' && !isAuthenticated(locals)) {
		throw error(401, 'Unauthorized');
	}

	const module = await match.importer();
	const ast = module.default?.ast;
	const metadata = module.default?.metadata ?? {};

	if (!ast) {
		throw error(500, 'Document AST was not generated');
	}

	return {
		ast,
		metadata,
		slug: match.slug,
		access: match.access
	};
}
