---
description: How to customize the theme, markdown, and components.
---

## Theme

The theme is very simple setup of variables in the `src/app.css` file. Here's what it looks like:

```postcss title="app.css"
@theme {
	--font-inter: 'Inter', var(--default-font-family);
	--spacing-header: 3.5rem;
	--spacing-sidebar-nav: 18rem;
	--spacing-sidebar-toc: 14rem;

	/* light mode colors */
	--color-background: var(--color-zinc-50);
	--color-foreground: var(--color-zinc-100);
	--color-border: var(--color-zinc-200);
	--color-primary: var(--color-zinc-800);
	--color-secondary: var(--color-zinc-600);
	--color-accent: var(--color-blue-600);
}

@layer base {
	.dark {
		/* dark mode colors */
		--color-background: var(--color-zinc-900);
		--color-foreground: var(--color-zinc-800);
		--color-border: var(--color-zinc-700);
		--color-primary: var(--color-zinc-200);
		--color-secondary: var(--color-zinc-400);
		--color-accent: var(--color-blue-400);
	}
}
```

The default theme is built off of tailwind variables, but these can be replaced with your rgb values, hex values, etc.

## Markdown

Markdown content can be styled in two different ways.

##### mdsx Blueprints (preferred method)

You can modifiy the msdx blueprint components directly to update their styling. This can be done with the html class attribute, or by adding a style block within that component. To read more about blueprints, head [here](/docs/configuration/markdown).

##### docs.css

You can also apply styling within the `src/routes/[...slug=docs]/docs.css` file. This is imported only in the `src/routes/[...slug=docs]/+page.svelte` file. This can be more useful to apply styles to multiple attributes, such as making all headings bold. 

## Components

For all other imported components, you can style them directly in the component. These are located under the `src/lib/components` folder.