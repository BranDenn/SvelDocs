---
description: A tabbed code block component for grouping related code snippets in markdown.
---

## Overview

`CodeGroup` renders multiple fenced code blocks as a single tabbed panel. Each code block becomes a tab, labelled by the block's `title` metadata. This is useful for showing code differences between package managers or different languages.

### Example

<CodeGroup value="JavaScript">
	```js title="JavaScript"
	console.log("Hello World!")
	```

	```py title="Python"
	print("Hello World!")
	```
</CodeGroup>

## Markdown Usage

Wrap multiple fenced code blocks inside a `<CodeGroup>` tag. The `title` fence attribute becomes the label for each tab:

````md
<CodeGroup value="JavaScript">
	```js title="JavaScript"
	console.log("Hello World!")
	```

	```py title="Python"
	print("Hello World!")
	```
</CodeGroup>
````

import Alert from '$ui/alert';

<Alert type="note">
	`CodeGroup` is registered as a global doc import, so no markdown import statment is needed — it is available on every docs page.
</Alert>

## Syncing Tabs Across Multiple Groups

Use a `contextId` to link multiple `CodeGroup` instances together. Selecting a tab in one automatically selects the matching tab in all others with the same id.

### Creating the Context

For syncing to work across pages and survive navigations, the shared context must be **created in a layout component** — not in markdown. The layout wrapping all docs pages is `src/routes/(docs)/[...slug=docs]/+layout.svelte`.

Call `createSharedValueContext` in the `+layout.svelte` to register the context. This shared context can be used between CodeGroups and the standard Tabs component.

```svelte title="src/routes/(docs)/[...slug=docs]/+layout.svelte"
<script lang="ts">
	import { createSharedValueContext } from '$ui/shared-value-context.svelte';

	createSharedValueContext({
		id: 'js-pkg-managers',
		initialValue: 'bun',
		useLocalStorage: true // optional prop to save the value in local storage
	});
</script>
```

### Using the Context in Markdown

Pass the same string used for `id` as the `contextId` prop on each `CodeGroup`:

````md
<CodeGroup contextId="js-pkg-managers">
	```bash title="bun"
	bun install
	```

	```bash title="npm"
	npm install
	```

	```bash title="pnpm"
	pnpm install
	```
</CodeGroup>

<CodeGroup contextId="js-pkg-managers">
	```bash title="bun"
	bun run dev
	```

	```bash title="npm"
	npm run dev
	```

	```bash title="pnpm"
	pnpm run dev
	```
</CodeGroup>
````

### Result

Try selecting one tab below and watch both code blocks update together.

<CodeGroup contextId="js-pkg-managers">
	```bash title="bun"
	bun install
	```

	```bash title="npm"
	npm install
	```

	```bash title="pnpm"
	pnpm install
	```
</CodeGroup>

<CodeGroup contextId="js-pkg-managers">
	```bash title="bun"
	bun run dev
	```

	```bash title="npm"
	npm run dev
	```

	```bash title="pnpm"
	pnpm run dev
	```
</CodeGroup>

## Editing the Component

The component source is built on top of the [bits-ui](https://bits-ui.com/docs/components/tabs) `Tabs` primitive and follows the shadcn tabs implementation. The component source lives in `$lib/components/ui/code-group`. 

| File | Purpose |
|---|---|
| `code-group.svelte` | Root tabs wrapper — controls `value` and optional `contextId` sync |
| `code-group-list.svelte` | Tab list row with the sliding indicator element |
| `code-group-trigger.svelte` | Individual tab button |
| `code-group-content.svelte` | Tab panel content area |
| `code-group.css` | Anchor-positioning animation for the active indicator |
| `index.ts` | Barrel exports |

## How It Works

The `CodeGroup` uses a custom rehype plugin to allow the simple markdown syntax shown on this page. It is parsed and converted into the actual `$lib/components/ui/code-group` components.

<CodeGroup value="Markdown Syntax">
	````md title="Markdown Syntax"
	<CodeGroup value="JavaScript">
		```js title="JavaScript"
		console.log("Hello World!")
		```

		```py title="Python"
		print("Hello World!")
		```
	</CodeGroup>
	````

	````svelte title="Converted Svelte Syntax"
	<CodeGroup.Root value="JavaScript">
		<CodeGroup.List>
			<CodeGroup.Trigger value="JavaScript">JavaScript</CodeGroup.Trigger>
			<CodeGroup.Trigger value="Python">Python</CodeGroup.Trigger>
		</CodeGroup.List>
		<CodeGroup.Content value="JavaScript">
			```js title="JavaScript"
			console.log("Hello World!")
			```
		</CodeGroup.Content>
		<CodeGroup.Content value="Python">
			```py title="Python"
			print("Hello World!")
			```
		</CodeGroup.Content>
	</CodeGroup.Root>
	````
</CodeGroup>

The actual fenced code area is converted via the `rehype-pretty-code` rehype plugin explained in the [Code Block Configuration](/docs/configuration/code-blocks).