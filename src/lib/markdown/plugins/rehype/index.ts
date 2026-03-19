/**
 * Rehype markdown AST plugin registry.
 *
 * This module exports individual plugin factories and the ordered plugin list
 * used by the markdown AST pipeline. The order matters:
 * 1) expose code metadata,
 * 2) transform CodeGroup into tab primitives,
 * 3) normalize MDX paragraph wrappers.
 */
export { rehypeNormalizeMdxParagraphs } from './normalize-mdx-paragraphs';
export { rehypePromoteCodeMeta } from './promote-code-meta';
export { rehypeTransformCodeGroup } from './transform-code-group';

import { rehypeNormalizeMdxParagraphs } from './normalize-mdx-paragraphs';
import { rehypePromoteCodeMeta } from './promote-code-meta';
import { rehypeTransformCodeGroup } from './transform-code-group';

/**
 * Default rehype plugin chain for markdown AST processing.
 */
export const rehypeMarkdownAstPlugins = [
	rehypePromoteCodeMeta,
	rehypeTransformCodeGroup,
	rehypeNormalizeMdxParagraphs
];
