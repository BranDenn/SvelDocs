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

<FileReader file="src/routes/(docs)/[...slug=docs]/docs.css" />

## Components

You can style any component using TailwindCSS or [scoped styles](https://svelte.dev/docs/svelte/scoped-styles). Some components, like the `pre` component, may use [global styles](https://svelte.dev/docs/svelte/global-styles).

Components can be found under the `src/lib/components` folder. Markdown specific components can be found under the `src/lib/markdown/components` folder.