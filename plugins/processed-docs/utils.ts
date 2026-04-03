import markdownConfig from '../../src/lib/markdown/markdown.config';

export const MARKDOWN_EXTENSIONS = new Set(
	(markdownConfig.extensions ?? []).map((extension) => extension.toLowerCase())
);
