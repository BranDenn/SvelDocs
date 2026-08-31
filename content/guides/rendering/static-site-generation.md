---
description: How to run SvelDocs as a prerendered static site.
---

import Alert from '$ui/alert';

## When To Use SSG (Static Site Generation)

Use static site generation when all of your docs are public and can be built ahead of time. This is the current default provided from this project.

The benefits are straightforward:

- Simple, typically free hosting
- Fast page loads
- CDN-friendly output
- No runtime server requirements

<Alert type="note">
	For server-side functionality such as authentication, use [Server-Side Rendering](/docs/guides/rendering/server-side-rendering).
</Alert>

## Configuration

The adapter is configured in `svelte.config.js`. The static adapter is the default.

```js title="svelte.config.js"
// import adapter from '@sveltejs/adapter-auto';
import adapterStatic from '@sveltejs/adapter-static';

const config = {
	...
	kit: {
		adapter: adapterStatic({
			fallback: '404.html'
		}),						 
		// adapter: adapter()
		...
	}
};
```

The static adapter generates `.html` and `.md` files instead of running a server for each request.

<Alert type="warning">
	If any of the docs are private, the build will fail and result in this error:
	`@sveltejs/adapter-static: all routes must be fully prerenderable.`
</Alert>

## Base Path Support

This project already supports a deployment base path in `svelte.config.js` for hosting on websites such as GitHub:

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

For deployment instructions, see [Deploy To GitHub Pages](/docs/guides/workflows/github-pages).