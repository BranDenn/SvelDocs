---
description: How to work with markdown and how to customize the markdown result.
---

<script lang="ts">
    import Alert from '$lib/components/ui/alert/alert.svelte'
</script>

## Frontmatter

Frontmatter is how metadata is defined in markdown. It is defined at the top of your markdown file between 3 dashes like this:

```md title=".md"
---
title: Example Title
description: Example Description
---

~~~ content normally goes here ~~~
```

The frontmatter is exposed to the `src/routes/[...slug=docs]/+page.svelte` file, api, and the search functionality. Any number of frontmatter can be defined, but will not be shown automatically. If you want additional frontmatter attributes to be shown on the page or search results, be sure to edit the `src/routes/[...slug=docs]/+page.svelte` or `src/lib/components/search/flexsearch.ts` files respectively.

<Alert type="warning">
    All frontmatter attributes from markdown files are exposed plublicly in the api and search results.
</Alert>

#### Type Safety

If you are adding additional frontmatter attributes and noticing typescript errors in other files, be sure to update the `MdFm` interface for ensuring strong typing. This can be configured in the `docs.config.ts` file.

```ts title="docs.config.ts"
export interface MdFm {
	title?: string;
	description?: string;
}
```

By default a title and description can be defined in the markdown frontmatter. If a title is defined, it uses this title instead of the navigation title on the page.

## Content

Content can be written with markdown, html, or svelte syntax. This means that content can be written quickly while allowing the option of custom svelte components thanks to [MDSX](https://mdsx.dev/docs).

View the [Markdown Syntax](/docs/miscellaneous/markdown-syntax) to see what you can do in markdown.

#### Blueprints

Blueprints is a useful feature provided by MDSX to override the default handling of markdown. A good example of this is how code blocks are handled. By default, code blocks do not have copy buttons attached, but a custom `pre.svelte` component with a copy button can be used instead (this is exactly what is done for SvelDocs).

All MDSX blueprint components are located under the `src/lib/components/mdsx` folder. The `.svelte` files are exported from the `src/lib/components/mdsx/index.ts` file like this:

```ts title="index.ts"
...
export { default as pre } from './code/pre.svelte';
export { default as a } from './links/a.svelte';
...
```

These are then exported in the `src/lib/components/mdsx/blueprint.svelte` file, which is used in MDSX to override the default markdown transformation.

```svelte title="blueprint.svelte"
<script lang="ts" module>
    // the default <pre> and <a> tags from markdown will now be replaced by these components.
	export { pre, a } from './index'; 
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

{@render children?.()}
```

<Alert type="note">
    The exported component must have the same name as the default html tags.
</Alert>