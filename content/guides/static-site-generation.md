---
description: How to run SvelDocs as a prerendered static site.
---

import Alert from '$ui/alert';

## When To Use SSG

Use static site generation when all of your docs are public and can be built ahead of time. This is the current default provided from this project.

The benefits are straightforward:

- Simple (typically free) Hosting
- Fast Page Loads
- CDN-friendly Output
- No Runtime Server Requirements

<Alert type="note">
	If you are looking to have server side functionality like auth, please refer to the [Server Side Rendering](/docs/guides/server-side-rendering) or [Auth](/docs/guides/auth) guides.
</Alert>

## The Current Static Setup

Static output is configured in `svelte.config.js`:

```js title="svelte.config.js"
import adapterStatic from '@sveltejs/adapter-static';

const config = {
	...
	kit: {
		adapter: adapterStatic({
			fallback: '404.html'
		}),,
		...
	}
};
```

The adapter-static generates static `.html` and `.md` files instead of running a server for each request.

<Alert type="warning">
	If any of the docs are private, the build will fail and result in this error:
	`@sveltejs/adapter-static: all routes must be fully prerenderable.`
</Alert>

## Base Path Support

This project already supports a deployment base path in `svelte.config.js` for hosting on websites such as Github:

```js title="svelte.config.js"
const config = {
	...
	kit: {
		...
		paths: {
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
		},
		...
	}
};
```

This is useful when deploying the static site under a subpath such as `your-username.github.io` instead of the domain root.

### Github Pages


This project provides a deploy workflow automatically for github pages. Feel free to remove it if you do not use it.

<FileReader file=".github/workflows/deploy.yml" />