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

## Choose The SvelDocs Directory

The workflow supports both standalone repositories and monorepos. Set `SVELDOCS_PATH` near the top of `.github/workflows/template-sync.yml` to the directory that contains the SvelDocs app:

```yaml title=".github/workflows/template-sync.yml"
env:
	SVELDOCS_PATH: '.' # SvelDocs is at the repository root
```

For a monorepo with the SvelDocs app under `docs`, use:

```yaml title=".github/workflows/template-sync.yml"
env:
	SVELDOCS_PATH: 'docs'
```

This setting applies to scheduled and manual runs. It must be a relative path and cannot contain `..` segments.

<Alert type="warning">
	Keep `template-sync.yml` under the repository root's `.github/workflows` directory, even when the SvelDocs app is under `docs`. GitHub does not discover workflow files inside `docs/.github/workflows`.
</Alert>

## Run An Update Check

The scheduled check runs weekly. To check immediately:

1. Open the **Actions** tab in your repository.
2. Select **Sync Template Updates**.
3. Select **Run workflow**.

If updates are available, the workflow creates a pull request from the `chore/template-sync` branch. Review its checks and resolve any conflicts before merging it. Repeated runs update the same open pull request instead of creating duplicates.

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

The `.templatesyncpaths` file explicitly lists the template-owned files and directories that can be changed:

<FileReader file=".templatesyncpaths" />

Everything outside that list remains untouched, including documentation content, site configuration, styling, environment files, and unrelated monorepo applications. Files removed from a managed directory in the template are also removed from that directory in the update pull request.

## Preserve Custom Files

Use `.templatesyncignore` for site-specific files that are located inside a managed directory. Paths are relative to the SvelDocs app, regardless of whether `SVELDOCS_PATH` is `.` or `docs`:

<FileReader file=".templatesyncignore" />

For example, use `src/lib/docs/server/navigation/doc-navigation.config.ts`, not `docs/src/lib/docs/server/navigation/doc-navigation.config.ts`, when the app is under `docs`. Add one exact file or directory path per line. The workflow preserves those paths when synchronizing their parent directories.

The default exclusions protect the navigation configuration, header logo wrapper, and shared logo component. Add other locally customized files before running the workflow. Because `.templatesyncignore` is downstream-owned, template update pull requests do not replace it.

## Workflow Updates

GitHub does not allow `GITHUB_TOKEN` to create or update files under `.github/workflows`. Those files are therefore excluded from template update pull requests.

Compare your workflow files with the [SvelDocs template workflows](https://github.com/BranDenn/SvelDocs/tree/main/.github/workflows) when release notes call out workflow changes. This includes updates to the [GitHub Pages deployment workflow](/docs/guides/workflows/github-pages) and the template sync workflow itself.

<Alert type="warning">
	A fine-grained personal access token or GitHub App can synchronize workflow files, but it adds a long-lived credential or extra application setup. The included workflow intentionally avoids that requirement.
</Alert>