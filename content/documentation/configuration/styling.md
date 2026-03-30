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

```css title="src/app.css"
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:where(.dark, .dark *));

/* default theme */
@theme {
	--font-inter: 'Inter', var(--default-font-family);

	/* light mode colors */
	--color-background: var(--color-zinc-50); /* background */
	--color-foreground: var(--color-zinc-800); /* default font color */
	--color-muted-foreground: var(--color-zinc-600); /* muted font color */
	--color-primary: var(--color-zinc-100); /* color 1 */
	--color-border: var(--color-zinc-200); /* border color */
	--color-accent: var(--color-indigo-600); /* accent color */
	--color-destructive: var(--color-red-500);

	--color-secondary: color-mix(
		in oklch,
		var(--color-background),
		var(--color-primary)
	); /* color 2 */
}

@layer theme {
	.dark {
		/* dark mode colors */
		--color-background: var(--color-zinc-950); /* background */
		--color-foreground: var(--color-zinc-200); /* default font color */
		--color-muted-foreground: var(--color-zinc-400); /* muted font color */
		--color-primary: var(--color-zinc-900); /* color 1 */
		--color-border: var(--color-zinc-800); /* border color */
		--color-accent: var(--color-emerald-400); /* accent color */
	}
}

@layer utilities {
	.container {
		@apply mx-auto max-w-360;
	}
}

@layer base {
	body {
		@apply bg-background text-foreground font-inter flex min-h-dvh flex-col overflow-x-hidden;
		scrollbar-color: var(--color-border) var(--color-background);
	}

	*,
	*::before,
	*::after {
		@apply border-border;
	}

	:disabled,
	[aria-disabled='true'] {
		@apply cursor-default opacity-50;
	}

	:invalid {
		@apply border-destructive ring-destructive/50;
	}

	:focus-visible {
		@apply border-accent/75 ring-accent/50 ring-2 transition-[border-color,box-shadow] outline-none;
	}

	kbd {
		@apply rounded-full border px-1.5 text-xs shadow;
	}

	a,
	button {
		@apply cursor-pointer;
	}

	mark {
		@apply text-accent bg-transparent underline;
	}

	input[type='search']::-webkit-search-cancel-button {
		@apply cursor-pointer;
	}

	.scrollbar-thin {
		scrollbar-width: thin;
	}
}
```

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