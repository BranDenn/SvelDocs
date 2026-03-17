---
description: Where styling and theme values live, and what to edit to customize the docs UI.
---

## Where to Edit Styling

Global styling is defined in `src/app.css`.

That file is the main place to configure:

- Fonts
- Light/dark color tokens
- Shared base styles (`body`, `a`, `button`, etc.)
- Utility layer overrides

The docs layout also has route-scoped style variables in `src/routes/(docs)/[...slug=docs]/docs.css`.

That file controls layout spacing tokens used for sticky headers, TOC offsets, and scroll offset behavior.

## Theme Switching

Theme mode is handled by `mode-watcher`.

- `src/routes/+layout.svelte` mounts `<ModeWatcher defaultMode="dark" />`
- `src/lib/components/docs/header/theme-switch.svelte` toggles mode with `toggleMode`

The dark mode class is `.dark`, and Tailwind variant support is configured in `src/app.css`:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

## Color Tokens

The main token set is in `src/app.css` under `@theme` and `@layer theme`.

Light mode tokens are declared in `@theme`, and dark mode overrides are inside `.dark`:

- `--color-background`
- `--color-foreground`
- `--color-muted-foreground`
- `--color-primary`
- `--color-border`
- `--color-accent`

Update these tokens to change the entire docs color system.

## Markdown Code Block Theme

Syntax highlighting theme names are configured in `src/lib/markdown/markdown.config.ts` via `rehype-pretty-code`:

```ts
rehypePrettyCode,
{
	theme: {
		light: 'github-light',
		dark: 'github-dark'
	},
	keepBackground: false
}
```

If you change these values, code block colors will update across all markdown pages.

## Docs Spacing Variables

In `src/routes/(docs)/[...slug=docs]/docs.css`, docs-specific spacing variables are defined with `@theme`:

- `--spacing-docs-header-main`
- `--spacing-docs-header-tabs`
- `--spacing-docs-header`
- `--spacing-docs-content-header-toc`
- `--spacing-docs-content-header`

These values affect sticky offsets and scroll anchoring for headings.

## Good Next Edits

Common customizations include:

- Replacing the font in `src/app.css`
- Updating light/dark token values in `src/app.css`
- Tweaking docs spacing vars in `src/routes/(docs)/[...slug=docs]/docs.css`
- Updating code highlighting themes in `src/lib/markdown/markdown.config.ts`
