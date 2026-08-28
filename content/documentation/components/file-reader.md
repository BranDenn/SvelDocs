---
description: Embed repository files as code blocks using the FileReader pseudo-component.
---

import Alert from '$ui/alert';

## Overview

`FileReader` reads a file and displays it as a code block. When the file changes, the code block updates the next time you build the site.

<Alert type="warning">
    This is not a Svelte component. A remark plugin turns it into a code block during development and builds.
</Alert>

## Usage

This "component" is a remark plugin and follows the same fenced-code metadata conventions described in the [Code Blocks](/docs/configuration/code-blocks) page.

Place the tag directly in your markdown like the following:

```md
<FileReader 
    file="src/app.css"
    title="app.css" 
    caption="Website style sheet" 
    highlight="2,4-6" 
    showLineNumbers 
/>
```

The plugin converts that into a fenced code block:

````md
```ts {2,4-6} showLineNumbers title="app.css" caption="Website style sheet"
// (file contents...)
```
````

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `file` | `string` | Relative or absolute path to a file. Relative paths start from the documentation project folder. |
| `title?` | `string` |  Override the displayed title (defaults to the file path). |
| `caption?` | `string` |  Optional caption / footer text for the code block. |
| `highlight?` | `string` | Line ranges to highlight. For example, `2,4-6` highlights lines 2, 4, 5, and 6. |
| `showLineNumbers?` | `boolean` | When present, enables line numbers for the block. |
| `regex?` | `string` | Extract only a regex match. Supports either `pattern` or `/pattern/flags` format. |
| `regexFlags?` | `string` | Optional regex flags (e.g. `im` or `s`). Ignored when flags are already provided inside `/.../flags`. |

## Filesystem Access

By default, `FileReader` can use `..` and absolute paths. This lets you show files from another project, such as an app next to your documentation site.

The file contents are published with your documentation. Do not use it to read passwords, environment files, or other private files.

To restrict access, configure one or more allowed roots in `src/lib/markdown/configuration/markdown.config.ts`:

```ts title="src/lib/markdown/configuration/markdown.config.ts"
const markdownConfig = defineConfig({
    remarkPlugins: [
        remarkGfm,
        [remarkFileReader, { allowedRoots: ['.', '../game'] }],
        remarkRehype
    ]
});
```

When `allowedRoots` is set, files must be inside one of those folders. This also applies to symbolic links. Relative paths start from the documentation project folder.