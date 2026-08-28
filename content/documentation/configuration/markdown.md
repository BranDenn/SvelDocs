---
description: How to configure and write in markdown files.
---

## Writing Markdown

A Markdown file has two main sections: optional metadata, called frontmatter, and the document content.

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

You can configure how Markdown is rendered in `src/lib/markdown/configuration/markdown.config.ts`. The configuration supports the following options:

```ts
type MarkdownConfig = {
	extensions: string[];
	remarkPlugins?: PluggableList;
	rehypePlugins?: PluggableList;
};
```

### Extensions

You can configure and add your own file extensions to be considered for the markdown rendering process. For example:

```ts title="src/lib/markdown/configuration/markdown.config.ts"
const markdownConfig = defineConfig({
	extensions: ['.md', '.mdx'],
	...
});
```

### Remark Plugins

You can configure or add remark plugins that run during the Markdown (MDAST) stage. Here is part of the provided default:

```ts title="src/lib/markdown/configuration/markdown.config.ts"
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

You can configure or add rehype plugins that run during the HTML-like (HAST) stage. Here is part of the provided default:

```ts title="src/lib/markdown/configuration/markdown.config.ts"
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

The generated AST is then rendered by `src/lib/markdown/renderer/blueprint-renderer.svelte`.