---
description: How to run SvelDocs with server-side rendering and when to switch away from the static adapter.
---

## When To Use SSR

Use server-side rendering when your docs need request-time behavior, such as:

- authenticated docs
- role-based access control
- user-specific navigation
- server-only data fetching

SvelDocs already uses server load functions for the docs routes, so the main SSR change is your adapter and deployment target.

## The File To Change

Adapter selection lives in [svelte.config.js](/workspaces/SvelDocs/svelte.config.js).

The starter is currently configured for static output:

```js
// import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static';
```

For SSR, replace the static adapter with the adapter that matches your host.

Common choices:

- `@sveltejs/adapter-auto` for platforms SvelteKit can detect automatically
- `@sveltejs/adapter-node` for your own Node server
- `@sveltejs/adapter-vercel` for Vercel
- `@sveltejs/adapter-netlify` for Netlify functions
- `@sveltejs/adapter-cloudflare` for Cloudflare

Example with `adapter-auto`:

```js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	extensions: ['.svelte'],
	kit: {
		adapter: adapter(),
		alias: {
			$components: 'src/lib/components',
			$ui: 'src/lib/components/ui',
			$utils: 'src/lib/utils',
			$css: 'src/app.css'
		}
	}
};

export default config;
```

## Install The Adapter

If you switch to an adapter that is not already installed, add it to your project first.

Example:

```bash
bun add -d @sveltejs/adapter-auto
```

Or install the adapter that matches your deployment platform.

## What Already Works In This Repo

The server-side docs flow is already in place:

- [src/routes/(docs)/[...slug=docs]/+layout.server.ts](/workspaces/SvelDocs/src/routes/(docs)/[...slug=docs]/+layout.server.ts) filters navigation and search groups on the server
- [src/routes/(docs)/[...slug=docs]/+page.server.ts](/workspaces/SvelDocs/src/routes/(docs)/[...slug=docs]/+page.server.ts) blocks access to private pages before rendering
- [src/lib/server/content/docs-access.ts](/workspaces/SvelDocs/src/lib/server/content/docs-access.ts) contains the access check

That means SSR is mostly a deployment concern, not a rendering rewrite.

## Important Difference From Static Output

The current starter is biased toward public static docs:

- [src/lib/server/content/docs-data.ts](/workspaces/SvelDocs/src/lib/server/content/docs-data.ts) only returns public entries from `getPublicDocEntries()`
- [src/routes/(docs)/[...slug=docs]/+page.server.ts](/workspaces/SvelDocs/src/routes/(docs)/[...slug=docs]/+page.server.ts) uses those entries
- [src/routes/(docs)/[...slug=docs].md/+server.ts](/workspaces/SvelDocs/src/routes/(docs)/[...slug=docs].md/+server.ts) is explicitly prerendered

If you want authenticated or role-restricted docs in SSR, stop treating those routes as public-only prerender targets. The server must be allowed to evaluate access at request time.

In practice, that usually means:

- keeping your runtime adapter instead of `adapter-static`
- removing or reworking public-only entry generation for protected routes
- leaving access checks in the server load and server endpoint handlers

## Recommended SSR Setup

1. Choose the adapter for your host in [svelte.config.js](/workspaces/SvelDocs/svelte.config.js).
2. Populate `event.locals` in [src/hooks.server.ts](/workspaces/SvelDocs/src/hooks.server.ts) from your real auth/session layer.
3. Keep `canAccessDoc(...)` as the single place that decides whether a doc is visible.
4. Only prerender routes that are genuinely public.

If your docs are fully public, SSG is usually simpler. If any content depends on the current user, move to SSR.
