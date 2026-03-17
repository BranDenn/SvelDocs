---
description: How to keep SvelDocs as a static site and which files control prerendered output.
---

## When To Use SSG

Use static site generation when your docs are public and can be built ahead of time.

This is the current default in the starter.

The benefits are straightforward:

- simple hosting
- fast page loads
- CDN-friendly output
- no runtime server requirements

## The Current Static Setup

Static output is configured in [svelte.config.js](/workspaces/SvelDocs/svelte.config.js):

```js
import adapter from '@sveltejs/adapter-static';
```

That adapter generates deployable static files instead of running a server for each request.

## What Gets Generated

SvelDocs uses public doc entries to decide what should be available in static output.

The core pieces are:

- [src/lib/server/content/docs-data.ts](/workspaces/SvelDocs/src/lib/server/content/docs-data.ts)
- [src/routes/(docs)/[...slug=docs]/+page.server.ts](/workspaces/SvelDocs/src/routes/(docs)/[...slug=docs]/+page.server.ts)
- [src/routes/(docs)/[...slug=docs].md/+server.ts](/workspaces/SvelDocs/src/routes/(docs)/[...slug=docs].md/+server.ts)

`getPublicDocEntries()` only returns docs where `private === false`, so private content is excluded from the generated entries list.

## Why That Matters

Static hosting cannot protect already-generated private files.

Because of that, the safe pattern is:

- prerender public docs
- do not generate protected docs into the build output
- reserve authenticated docs for SSR deployments

If a page needs user-specific access checks, it should not be treated as a static asset.

## Keeping SSG Working Well

For a fully static docs site, keep these patterns:

1. Use `@sveltejs/adapter-static` in [svelte.config.js](/workspaces/SvelDocs/svelte.config.js).
2. Keep docs public, or ensure protected docs are excluded from prerendered entries.
3. Use [src/lib/server/navigation/doc-navigation.config.ts](/workspaces/SvelDocs/src/lib/server/navigation/doc-navigation.config.ts) to organize tabs, groups, and pages.
4. Continue authoring content in `content/` and let the processed docs pipeline build navigation and search data.

## Base Path Support

This repo already supports a deployment base path in [svelte.config.js](/workspaces/SvelDocs/svelte.config.js):

```js
paths: {
	base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
}
```

That is useful when deploying the static site under a subpath such as `/docs` instead of the domain root.

## When To Leave SSG

Move to SSR when you need:

- authenticated docs
- role-based private pages
- request-time server data
- per-user navigation or search filtering

If your entire site is public documentation, SSG should remain the simplest deployment model.