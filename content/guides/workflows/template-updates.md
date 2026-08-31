---
description: Receive SvelDocs template updates through reviewable pull requests.
---

import Alert from '$ui/alert';

## How Template Updates Work

GitHub creates an independent repository from a template. The new repository does not remain connected to the template and does not receive later changes automatically.

SvelDocs includes an opt-in workflow that checks `BranDenn/SvelDocs` for updates every Monday and can also be run manually. When shared infrastructure changes, it opens a pull request in your repository for review.

<Alert type="note">
	The workflow never merges updates automatically. Your normal reviews, status checks, and branch protection rules still apply.
</Alert>

## Enable Update Pull Requests

GitHub may prevent workflows from creating pull requests until you enable the repository setting:

1. Open **Settings > Actions > General** in your repository.
2. Under **Workflow permissions**, select **Read and write permissions**.
3. Select **Allow GitHub Actions to create and approve pull requests**.
4. Save the changes.

No personal access token is required. The workflow uses the repository's temporary `GITHUB_TOKEN` and reads the public SvelDocs template.

## Run An Update Check

The scheduled check runs weekly. To check immediately:

1. Open the **Actions** tab in your repository.
2. Select **Sync Template Updates**.
3. Select **Run workflow**.

If updates are available, the workflow creates a pull request labeled `template-sync`. Review its checks and resolve any conflicts before merging it. Repeated runs do not create another pull request for the same template revision.

<FileReader file=".github/workflows/template-sync.yml" />

## Change The Schedule

The default cron expression runs at 09:00 UTC every Monday:

```yaml title=".github/workflows/template-sync.yml"
on:
	schedule:
		- cron: '0 9 * * 1'
	workflow_dispatch:
```

Change the final number to choose another day: `0` or `7` is Sunday, `1` is Monday, and `6` is Saturday. For example, use `'0 9 * * 5'` to check every Friday at 09:00 UTC. GitHub Actions schedules use UTC and may start later during periods of high demand.

To disable scheduled checks and keep only the **Run workflow** button, replace the trigger with:

```yaml title=".github/workflows/template-sync.yml"
on:
	workflow_dispatch:
```

## What Gets Updated

Update pull requests include shared application code, routes, Markdown processing plugins, dependencies, and build configuration.

The `.templatesyncignore` file protects files that commonly belong to each documentation site:

<FileReader file=".templatesyncignore" />

Changes to ignored paths must be applied manually when you want them. Keep local customizations inside the protected paths where possible to reduce merge conflicts in future updates.

## Workflow Updates

GitHub does not allow `GITHUB_TOKEN` to create or update files under `.github/workflows`. Those files are therefore excluded from template update pull requests.

Compare your workflow files with the [SvelDocs template workflows](https://github.com/BranDenn/SvelDocs/tree/main/.github/workflows) when release notes call out workflow changes. This includes updates to the [GitHub Pages deployment workflow](/docs/guides/workflows/github-pages) and the template sync workflow itself.

<Alert type="warning">
	A fine-grained personal access token or GitHub App can synchronize workflow files, but it adds a long-lived credential or extra application setup. The included workflow intentionally avoids that requirement.
</Alert>