---
description: How to run SvelDocs as a prerendered static site.
---

## When To Use SSG

Use static site generation when all of your docs are public and can be built ahead of time. This is the current default provided from this project.

The benefits are straightforward:

- simple hosting
- fast page loads
- CDN-friendly output
- no runtime server requirements

If you are looking to have private docs protected by auth, please refer to the [Server Side Rendering Guide](/docs/guides/server-side-rendering).

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

import Alert from '$ui/alert';

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

```yml title=".github/workflows/deploy.yml"
name: Deploy to GitHub Pages

on:
  push:
    branches: 'main'

jobs:
  build_site:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: build
        env:
          BASE_PATH: '/${{ github.event.repository.name }}'
        run: bun run build

      - name: Upload Artifacts
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'build/'

  deploy:
    needs: build_site
    runs-on: ubuntu-latest

    permissions:
      pages: write
      id-token: write

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```
