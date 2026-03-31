---
description: Embed repository files as code blocks using the FileReader pseudo-component.
---

import Alert from '$ui/alert';

## Overview

`FileReader` is a pseudo-component used to read a file and convert it into a markdown code block. This solves the issue of changing code blocks manually if a file you are referencing changes.

<Alert type="warning">
    This is not a real Svelte component — it is processed at build time by a remark plugin and replaced with a code fence.
</Alert>

## Usage

This "component" is a remark plugin and follows the same fenced-code metadata conventions described in the [Code Blocks](/docs/configuration/code-blocks) page.

Place the tag directly in your markdown like the following:

````md
<FileReader 
    file="/absolute/path/to/src/lib/markdown/plugins/remark/remark-file-reader.ts" 
    title="remark-file-reader.ts" 
    caption="Remark plugin file" 
    highlight="2,4-6" 
    showLineNumbers 
/>
````

The plugin converts that into a fenced code block:

```ts {2,4-6} showLineNumbers title="remark-file-reader.ts" caption="Remark plugin file"
// (file contents...)
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `file` | `string` | Absolute path to the file on disk. The path must be accessible during the build. |
| `title?` | `string` |  Override the displayed title (defaults to the file basename). |
| `caption?` | `string` |  Optional caption/footer text for the code block. |
| `highlight?` | `string` | Line ranges to highlight, e.g. `2,4-6`. The plugin will wrap this in `{}` when emitting metadata. |
| `showLineNumbers?` | `boolean` | When present, enables line numbers for the block. |