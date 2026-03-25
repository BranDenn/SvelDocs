---
description: How to create and import custom components into markdown files.
---

## Two Ways to Customize Components

SvelDocs supports both:

- Global renderer / blueprints for markdown elements (`h1`, `a`, `pre`, etc.)
- Per-page component imports used directly in markdown

## Global Element Overrides / Blueprints

Global renderer / blueprint mapping is in the `src/lib/markdown/components/index.ts` file. This is used to convert any HTML element into a defined component and or add components that are always imported into the documentation. This is similar to blueprints in markdown compilers like mdx or mdsvex.

The `blueprints` variable is used to define the data. Below is an example.

```ts
// import components to use
import Pre from './code/pre.svelte';
import InlineCode from './code/inline-code.svelte';
import { CodeGroup, CodeGroupContent, CodeGroupList, CodeGroupTrigger } from '$ui/code-group';

export const blueprints = {
    // The `<pre>` HTML element is converted into the imported `Pre` component.
	pre: Pre,

    // A resolve function can be used to transform HTML elements in specific ways.
    // In this example, the `<code>` HTML element is ignored if it is a child of a `<pre>` HTML element.
    // Otherwise, it becomes an InlineCode component.
	code: resolver((context) => {
		if (context.parentElement === 'pre') return null;
		return { component: InlineCode, inheritNodeProps: true };
	}),

    // Components without a key will simply be available to every doc.
    // This is specifically for things that are NOT converted from HTML elements.
    // This is required for `CodeGroup` to allow the custom markdown syntax and still render correctly.
	CodeGroup,
	CodeGroupList,
	CodeGroupTrigger,
	CodeGroupContent
};
```

## Import Components Inside Markdown Files

You can import components directly into markdown files just like javascript. This should be used for most custom components that are NOT converted from an HTML element.

```md
import Alert from '$ui/alert';

<Alert type="note">This is a custom component in markdown.</Alert>
```

## How It Works

import * as Steps from '$ui/steps';

<Steps.Root>
    <Steps.Title>Define Blueprints or Import</Steps.Title>
    <Steps.Body>
        Either add a blueprint mapping in `src/lib/markdown/components/index.ts` for a markdown HTML element (like `<pre>`, `<code>`, `<a>`), or import your component directly inside a markdown file.
    </Steps.Body>

    <Steps.Title>Build-Time Custom Component Processing</Steps.Title>
    <Steps.Body>
        During the build, imports in markdown files are extracted and added to the component manifest via the `plugins/vite-mdx-component-manifest.ts`. Blueprints are registered globally and become available to all doc pages.
    </Steps.Body>

    <Steps.Title>Build-Time AST Generation & Rendering</Steps.Title>
    <Steps.Body>
        All markdown is parsed into AST during the build via the `plugins/vite-search-json.ts`. The AST is a JSON structure that is passed from the server to the client where it is rendered via the `BlueprintRenderer.svelte` component.
    </Steps.Body>

    <Steps.Title>Component Output</Steps.Title>
    <Steps.Body>
        The component `BlueprintRenderer.svelte` reads through the AST JSON to map HTML element tags into Blueprints and renders everything accordingly.
    </Steps.Body>
</Steps.Root>