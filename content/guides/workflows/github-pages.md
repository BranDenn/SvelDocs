---
description: Deploy a statically generated SvelDocs site to GitHub Pages.
---

import Alert from '$ui/alert';

## Configure GitHub Pages

SvelDocs includes a workflow that validates, builds, and deploys the site whenever you push to the `main` branch.

In your GitHub repository, open **Settings > Pages** and set **Source** to **GitHub Actions**. The next push to `main` will run the deployment workflow.

<Alert type="note">
	GitHub Pages hosts static output. Keep the default static adapter configuration described in [Static Site Generation](/docs/guides/rendering/static-site-generation).
</Alert>

## Deployment Workflow

The workflow performs four tasks:

1. Installs dependencies with Bun
2. Runs the tests, Svelte checks, and linting
3. Builds the site with a repository-specific base path
4. Uploads and deploys the generated `build` directory

<FileReader file=".github/workflows/deploy.yml" />

The `BASE_PATH` value is set to the repository name so project sites work at URLs such as `https://your-username.github.io/your-repository`.

If you deploy at the root of a custom domain or an organization site, update or remove `BASE_PATH` to match that URL structure.

You can remove this workflow if you deploy to a different host. See [Template Updates](/docs/guides/workflows/template-updates) before customizing it, because workflow files are not changed by automated template update pull requests.
