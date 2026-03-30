---
description: How to configure and write in markdown files.
---

## Writing Markdown

Markdown is basically split into two sections, one for the metadata of the file or `frontmatter`, and the other for the actual content.

### Frontmatter

Frontmatter is metadata defined at the top of a markdown file:

````md
---
title: Example Title
description: Example Description
keywords: config, markdown
icon: file-text
private: admin
---

**Content goes here**.
````

### Content

Content can include markdown, HTML, and svelte components. If you are new to markdown syntax, please refer to the [Markdown Syntax](/docs/miscellaneous/markdown-syntax) page to see what can be done.

## Configure Rendering

You can configure how markdown is rendered in the `$lib/markdown/markdown.config.ts` file. This allows to configure the following:

```ts
type MarkdownConfig = {
	extensions: string[];
	remarkPlugins?: PluggableList;
	rehypePlugins?: PluggableList;
};
```

### Extensions

You can configure and or add your own file extensions to be considered for the markdown rendering process. For Example:

```ts title="$lib/markdown/markdown.config.ts"
const markdownConfig = defineConfig({
	extensions: ['.md', '.mdx'],
	...
});
```

### Remark Plugins

You can configure and or add your own remark plugins that run on the markdown (MDAST) stage. Here is the provided default:

```ts title="$lib/markdown/markdown.config.ts"
const markdownConfig = defineConfig({
	...
	remarkPlugins: [
		remarkGfm,
		[
			remarkRehype,
			{
				footnoteBackContent: '↩\uFE0E'
			}
		]
	],
	...
});
```

### Rehype Plugins

You can configure and or add your own rehype plugins that run on the HTML-like (HAST) stage. Here is the provided default:

```ts title="$lib/markdown/markdown.config.ts"
const markdownConfig = defineConfig({
	...
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
		],
		...rehypeMarkdownAstPlugins
	]
});
```

## How It Is Used

The markdown config is consumed by the `plugins/processed-docs/markdown-to-ast.ts` file to process markdown at build time. Here is the rundown:

1. Parses frontmatter and markdown.
2. Applies configured remark plugins.
3. Applies configured rehype plugins.
4. Produces an AST used by the docs page renderer.

The generated AST is then rendered by `src/lib/markdown/BlueprintRenderer.svelte`.