---
description: How to clone the repo and get the boilerplate running.
---

import Alert from '$ui/alert';
import { Steps, Step } from '$ui/steps';
import * as Tabs from '$ui/tabs';
import { Tree, TreeFolder, TreeFile } from '$ui/tree';

## Setup

<Steps>
	<Step id="clone-repository" title="Clone Repository">
		```bash
		git clone https://github.com/BranDenn/SvelDocs
		```
	</Step>

	<Step id="install-packages" title="Install Packages">
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
	</Step>

	<Step id="start-dev-server" title="Start Dev Server">
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
	</Step>

	<Step id="edit-site-config" title="Edit Site Settings / Config">
		Navigate to the `$lib\configuration\site.config.ts` file to edit general site settings. These settings apply to the various parts of the site (not just docs) including SEO, `llms.txt`, and `sitemap.xml`. Feel free to add your own settings.

		```ts title="$lib\configuration\site.config.ts"
		export default {
			name: 'SvelDocs',
			origin: 'https://brandenn.github.io/SvelDocs',
			description: 'Documentation for SvelDocs, a SvelteKit-based documentation generator.'
		};
		```
	</Step>

	<Step id="edit-docs-config" title="Edit Doc Settings / Config">
		Navigate to the `$lib\configuration\docs.config.ts` file to edit general settings specific to docs. Feel free to add your own settings.

		```ts title="$lib\configuration\docs.config.ts"
		export default {
			github: 'https://github.com/BranDenn/SvelDocs'
		};
		```
	</Step>

	<Step id="edit-doc-navigation-config" title="Edit Document Navigation Settings / Config">
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
	</Step>

	<Step id="add-markdown" title="Add Your Own Markdown">
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
									title: 'Components',
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
				<Tree open noInteraction>
					<TreeFolder name="content">
						<TreeFolder name="documentation">
							<TreeFolder name="getting-started">
								<TreeFile name="introduction.md"/>
								<TreeFile name="quick-start.md"/>
							</TreeFolder>
							<TreeFolder name="components">
								<TreeFile name="accordion.md"/>
								<TreeFile name="button.md"/>
								<TreeFile name="dialog.md"/>
							</TreeFolder>
						</TreeFolder>
						<TreeFolder name="guides">
							<TreeFile name="introduction.md"/>
							<TreeFile name="quick-start.md"/>
						</TreeFolder>
					</TreeFolder>
				</Tree>
			</Tabs.Content>
		</Tabs.Root>
	</Step>
</Steps>