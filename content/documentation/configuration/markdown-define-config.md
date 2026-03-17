---
description: Complete reference for markdown defineConfig and where each option is consumed.
---

## File Locations

Markdown configuration is split across two files:

- `src/lib/markdown/define-config.ts` defines the `MarkdownConfig` type and `defineConfig(...)` helper.
- `src/lib/markdown/markdown.config.ts` creates the actual config object used at runtime.

## MarkdownConfig API

`define-config.ts` exposes this shape:

```ts
export type MarkdownConfig = {
	extensions: string[];
	remarkPlugins?: PluggableList;
	rehypePlugins?: PluggableList;
};
```

### `extensions`

An array of supported markdown file extensions.

Example:

```ts
extensions: ['.md', '.mdx']
```

This list is used by the docs build pipeline to decide which files in `content/` are considered markdown.

### `remarkPlugins`

Optional remark plugins that run on the markdown (MDAST) stage.

In the default config this includes `remark-gfm` and `remark-rehype` options.

### `rehypePlugins`

Optional rehype plugins that run on the HTML-like (HAST) stage.

In the default config this includes `rehype-slug` and `rehype-pretty-code`.

## How It Is Used

The markdown config is consumed by `plugins/processed-docs/markdown-to-ast.ts`.

That pipeline:

1. Parses frontmatter and markdown.
2. Applies configured remark plugins.
3. Applies configured rehype plugins.
4. Produces an AST used by the docs page renderer.

The generated AST is then rendered by `src/lib/markdown/BlueprintRenderer.svelte`.

## Example Config (Current)

```ts
const markdownConfig = defineConfig({
	extensions: ['.md', '.mdx'],
	remarkPlugins: [
		remarkGfm,
		[
			remarkRehype,
			{
				footnoteBackContent: '↩\uFE0E'
			}
		]
	],
	rehypePlugins: [
		rehypeSlug,
		[
			rehypePrettyCode,
			{
				theme: {
					light: 'github-light',
					dark: 'github-dark'
				},
				keepBackground: false
			}
		]
	]
});
```

## Practical Tips

- Keep `extensions` in sync with the file types you actually store under `content/`.
- If you add or remove plugins, test both `.md` and `.mdx` docs pages.
- For code block style changes, update `rehype-pretty-code` options in `src/lib/markdown/markdown.config.ts`.
