---
description: How markdown files are parsed, rendered, and customized in SvelDocs.
---

import Alert from '$ui/alert';

## Supported File Types

By default, docs content supports both `.md` and `.mdx` files.

This is configured in `src/lib/markdown/markdown.config.ts`:

```ts
extensions: ['.md', '.mdx']
```

Update that list if you want to include or exclude file extensions.

## Frontmatter

Frontmatter is metadata defined at the top of a markdown file:

````md
---
title: Example Title
description: Example Description
keywords: config, markdown
icon: file-text
private: admin
---

Page content goes here.
````

Frontmatter is parsed in the markdown pipeline (`plugins/processed-docs/markdown-to-ast.ts`) and attached to each docs record.

Commonly used frontmatter keys:

- `title`
- `description`
- `keywords`
- `icon`
- `private`

<Alert type="warning">
	Frontmatter data is included in docs metadata and can be used by search and rendering logic.
	Avoid storing sensitive values in markdown frontmatter.
</Alert>

## Content

Content can include markdown, HTML, and MDX component usage.

SvelDocs converts markdown into an AST, then renders that AST through `src/lib/markdown/BlueprintRenderer.svelte`.

Global markdown element rendering is configured in `src/lib/markdown/components/index.ts`.

View the [Markdown Syntax](/docs/miscellaneous/markdown-syntax) to see what you can do in markdown.

## Next Configuration Pages

For detailed configuration references, see:

- [Styling](/docs/configuration/styling)
- [Markdown Define Config](/docs/configuration/markdown-define-config)
- [Define Doc Navigation](/docs/configuration/define-doc-navigation)
- [Custom Components](/docs/configuration/custom-components)
