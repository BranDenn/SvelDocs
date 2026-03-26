---
description: How to clone the repo and get the boilerplate running.
---

import Alert from '$ui/alert';
import * as Steps from '$ui/steps';
import * as Tabs from '$ui/tabs';

## Setup

<Steps.Root>
	<Steps.Title id="clone-repository">Clone Repository</Steps.Title>
	<Steps.Body>
		```bash
		git clone https://github.com/BranDenn/SvelDocs
		```
	</Steps.Body>

	<Steps.Title id="install-packages">Install Packages</Steps.Title>
	<Steps.Body>
		<CodeGroup contextId="js-pkg-managers">
			```bash title="bun"
			bun install
			```

			```bash title="npm"
			npm install
			```

			```bash title="pnpm"
			pnpm install
			```
		</CodeGroup>
	</Steps.Body>

	<Steps.Title id="start-dev-server">Start Dev Server</Steps.Title>
	<Steps.Body>
		<CodeGroup contextId="js-pkg-managers">
			```bash title="bun"
			bun run dev
			```

			```bash title="npm"
			npm run dev
			```

			```bash title="pnpm"
			pnpm run dev
			```
		</CodeGroup>
	</Steps.Body>

	<Steps.Title id="edit-site-config">Edit Site Settings / Config</Steps.Title>
	<Steps.Body>
		Navigate to the `$lib\configuration\site.config.ts` file to edit general site settings. These settings apply to the various parts of the site (not just docs) including SEO, `llms.txt`, and `sitemap.xml`. Feel free to add your own settings.

		```ts title="$lib\configuration\site.config.ts"
		export default {
			name: 'SvelDocs',
			origin: 'https://brandenn.github.io/SvelDocs',
			description: 'Documentation for SvelDocs, a SvelteKit-based documentation generator.'
		};
		```
	</Steps.Body>

	<Steps.Title id="edit-docs-config">Edit Doc Settings / Config</Steps.Title>
	<Steps.Body>
		Navigate to the `$lib\configuration\docs.config.ts` file to edit general settings specific to docs. Feel free to add your own settings.

		```ts title="$lib\configuration\docs.config.ts"
		export default {
			github: 'https://github.com/BranDenn/SvelDocs'
		};
		```
	</Steps.Body>

	<Steps.Title id="edit-doc-navigation-config">Edit Document Navigation Settings / Config</Steps.Title>
	<Steps.Body>
		Navigate to the `$lib\server\navigation\doc-navigation.config.ts` file to edit the document navigation settings. Refer to the [Doc Navigation](/docs/configuration/doc-navigation) for more detail.

		<Alert type="caution">
			The navigation config should always be under the `$lib\server` folder to prevent exposure of potential private documents.
		</Alert>

		```ts title="$lib\server\navigation\doc-navigation.config.ts"
		const docNavigationConfig = defineDocNavigation({
			tabNextPrev: true,
			tabs: [
				{
					title: 'Documentation',
					combineHref: false,
					icon: 'flag',
					groups: [
						{
							title: 'Getting Started',
							icon: 'goal',
							showTitle: false,
							combineHref: false,
							pages: [
								{ title: 'Introduction', icon: 'book-open-check', href: '/docs' },
								{ title: 'Quick Start', icon: 'rocket' }
							]
						},
						{
							title: 'Configuration',
							icon: 'cog',
							pages: 'auto'
						},
						{
							title: 'Components',
							icon: 'blocks',
							pages: 'auto'
						},
						{
							title: 'Miscellaneous',
							icon: 'dices',
							pages: 'auto'
						}
					]
				},
				{
					title: 'Guides',
					combineHref: true,
					icon: 'book',
					pages: 'auto'
				}
			]
		});
		```
	</Steps.Body>

	<Steps.Title id="add-markdown">Add Your Own Markdown</Steps.Title>
	<Steps.Body>
		Navigate to the `content` folder to add your own markdown files. Idealy the folder structure should correspond to your navigation structure.

		<Tabs.Root value="config">
			<Tabs.List>
				<Tabs.Trigger value="config">Navigation Config</Tabs.Trigger>
				<Tabs.Trigger value="folder">Folder Structure</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="config">
				```ts
				const docNavigationConfig = defineDocNavigation({
					tabs: [
						{
							title: 'Documentation',
							groups: [
								{
									title: 'Getting Started',
									pages: 'auto'
								},
								{
									title: 'Configuration',
									icon: 'cog',
									pages: 'auto'
								},
								{
									title: 'Components',
									icon: 'blocks',
									pages: 'auto'
								},
								{
									title: 'Miscellaneous',
									icon: 'dices',
									pages: 'auto'
								}
							]
						},
						{
							title: 'Guides',
							combineHref: true,
							icon: 'book',
							pages: 'auto'
						}
					]
				});
				```
			</Tabs.Content>
			<Tabs.Content value="folder">

			</Tabs.Content>
		</Tabs.Root>
	</Steps.Body>
</Steps.Root>