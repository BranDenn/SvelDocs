---
title: Security and Trust Model
description: The security and trust boundaries used when SvelDocs processes and renders Markdown.
---

import Alert from '$ui/alert';

## Trust Model

SvelDocs is designed for Markdown and MDX files that you trust and store with your project. Vite processes these files during development and builds.

SvelteKit can turn the processed content into static pages or render it on a server. This depends on your adapter and access settings.

<Alert type="warning">
	Do not use SvelDocs to display Markdown submitted by visitors. Supporting user content requires extra security checks that are not included in this template.
</Alert>

## Rendering Safety

SvelDocs turns Markdown into Svelte elements. It does not insert the Markdown as raw HTML with `{@html}`.

Markdown links can point to pages, websites, email addresses, and phone numbers. Unsafe links such as `javascript:` and `data:` are disabled.

## MDX Components

Markdown and MDX files can import Svelte components. These components run project code, so only trusted people should be able to edit your content files.

## FileReader

`FileReader` can read files outside the documentation project. This is useful for monorepos and nearby apps, but any file it reads will be published in your documentation.

Use [`allowedRoots`](/docs/components/file-reader#filesystem-access) to limit which folders it can read. Never reference secrets or private environment files.

## Server-Side Rendering

SSR lets you check authorization and load server data for each request. Your Markdown files are still processed by Vite and must come from a trusted source. See [Server-Side Rendering](/docs/guides/server-side-rendering) for adapter and authentication setup.