---
description: How to style the website, docs routes, and components.
---

## Overview

SvelDocs has a simple structure for editing styles. You can add your own variables or classes, but for common use cases, like changing the theme of the website, you can simply change css variables.

## Global Website Styles / Theme

Global styling is defined in the `src/app.css` file. This is meant to configure the styling for the entire website (in case you have more than just docs). This includes:

- Fonts
- Light / Dark color variables
- Shared base styles (`body`, `a`, `button`, etc.)
- Utilities

Here is the provided default theme:

<FileReader file="src/app.css" />

### Dark & Light Mode

You can change the light and dark themes in the `app.css` file as shown above. You can also use the TailwindCSS `dark:` variant in specific components if needed.

Themes modes are handled by [mode watcher](https://mode-watcher.sveco.dev/docs).

- `src/routes/+layout.svelte` mounts `<ModeWatcher defaultMode="dark" />`
- `src/lib/components/docs/header/theme-switch.svelte` toggles the mode.

## Docs Specific Styles

Docs specific styling is defined in the `src/routes/(docs)/[...slug=docs]/docs.css` file. This is meant to configure the styling specific to the `/docs` routes. This only configures the size of the heading.

Here is the provided default theme:

```css title="src/routes/(docs)/[...slug=docs]/docs.css"
@import '$css';

@theme {
	--spacing-docs-header-main: 3rem;
	--spacing-docs-header-tabs: 2rem;
	--spacing-docs-header-main-border: 1px;
	--spacing-docs-header: calc(
		var(--spacing-docs-header-main) + var(--spacing-docs-header-main-border)
	);

	--spacing-docs-content-header-toc: 2.25rem;
	--spacing-docs-content-header-toc-border: 1px;
	--spacing-docs-content-header: calc(
		var(--spacing-docs-content-header-toc) + var(--spacing-docs-content-header-toc-border)
	);
}

@layer utilities {
	[data-docs-tabs='true'] {
		@apply sm:[--spacing-docs-header:calc(var(--spacing-docs-header-main)+var(--spacing-docs-header-tabs)+var(--spacing-docs-header-main-border))];
	}

	[data-docs-toc='true'] {
		@apply xl:[--spacing-docs-content-header:0px];
	}

	[data-docs-toc='false'] {
		@apply lg:[--spacing-docs-content-header:0px];
	}
}
```

## Components

You can style any component using TailwindCSS or [scoped styles](https://svelte.dev/docs/svelte/scoped-styles). Some components, like the `pre` component, may use [global styles](https://svelte.dev/docs/svelte/global-styles).

Components can be found under the `$lib/components` folder. Markdown specific components can be found under the `$lib/markdown/components` folder.