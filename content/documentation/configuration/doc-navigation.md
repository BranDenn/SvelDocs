---
description: How to define the look and structure of document navigation such as tabs, groups, pages, routing, access, etc.
---

import Alert from '$ui/alert';

## Overview

Navigation configuration can be configured in the `src/lib/server/navigation/doc-navigation.config.ts` file. It uses a `defineDocNavigation` helper function to provide strong type safety for all of the options.

## Tabs, Groups, and Pages

The config supports multiple "modes":

- `Tabs`: Categorizes `Groups` / `Pages` and displays the tabs in the header for `/docs` routes.
- `Groups`: Categorizes `Pages` and displays the groups in the sidebar for `/docs` routes.
- `Pages`: Refers to your actual markdown pages.

<Alert type="note">
	The `docNavigationConfig` requires a certain hierarchy for the "modes" as follows: `Tabs > Groups > Pages`. For example, `Tabs` can have `Groups`, but `Groups` cannot have `Tabs`. The `defineDocNavigation` function helps with type safety.
</Alert>

### Defining Tabs

`Tabs` can have both `Groups` and `Pages`. Below is an example of defined `Tabs`:

```ts title="Tab-Navigation-Example.ts"
const docNavigationConfig = defineDocNavigation({
	tabNextPrev: true, // allows next and previous buttons on a page to go to next tabs
	tabs: [ // define tabs or use 'auto' to load from file system.
		{
			title: 'Documentation',
			groups: [ // create a group under the 'Documentation' tab.
				{
					title: 'Getting Started',
					pages: 'auto' // automatically load markdown pages inside the 'Getting Started' group.
				}
			]
		},
		{
			title: 'Guides',
			pages: 'auto' // automatically load markdown pages inside the 'Guides' tab. A group is not required.
		}
	]
});
```

#### Tab Options

Below are the options used directly in the `docNavigationConfig` for `Tabs`:

| Option | Type | Description |
| --- | --- | --- |
| `tabs` | `DocTab<TRole>[] \| 'auto'` | A list of tabs to include in the docs navigation. If `"auto"`, tabs are generated from the filesystem. |
| `tabNextPrev?` | `boolean` | Enables previous/next page links that can continue across tab boundaries. Defaults to `false` when omitted. |

Below are the options for the `tabs` option from the above table:

| Option | Type | Description |
| --- | --- | --- |
| `title` | `string` | The name of the tab. This is displayed in the header. |
| `icon?` | `string` |  The icon to display next to the title of a tab. |
| `folderPath?` | `string` |  The corresponding markdown folder location for the tab. This defaults to `content/{tabTitle}`. |
| `combineHref?` | `boolean` | Determines if the tab title will be used in the link. |
| `private?` | `boolean \| TRole \| TRole[]` | Determines if this tab and its groups/pages require auth. Read the [auth guide](/docs/guides/auth) for more info. |
| `pages?` | `PageItems<TRole> \| 'auto'` | A list of pages to include in the tab. Cannot be used if groups is defined. |
| `groups?` | `DocGroup<TRole>[] \| 'auto'` | A list of groups to include in the tab. Cannot be used if pages is defined. |

### Defining Groups

`Groups` can only have `Pages`, but they can be created inside `Tabs`. Below is an example of defined `Groups`:

```ts title="Group-Navigation-Example.ts"
const docNavigationConfig = defineDocNavigation({
	groups: [ // define groups or use 'auto' to load from file system.
		{
			title: 'Getting Started',
			pages: 'auto' // automatically load markdown pages inside the 'Getting Started' group.
		},
		{
			title: 'Configuration',
			pages: 'auto' // automatically load markdown pages inside the 'Configuration' group.
		}
	]
});
```

#### Group Options

Below are the options used directly in the `docNavigationConfig` for `Groups`:

| Option | Type | Description |
| --- | --- | --- |
| `groups` | `DocGroup<TRole>[] \| 'auto'` | A list of groups to include in the docs navigation. If `"auto"`, groups are generated from the filesystem. |

Below are the options for the `groups` option from the above table:

| Option | Type | Description |
| --- | --- | --- |
| `title` | `string` | The name of the group. This is used to categorize navigation pages. |
| `icon?` | `string` |  The icon to display next to the title of a group. |
| `showTitle?` | `boolean` | Determines if the group title will be shown in the navigation sidebar. This defaults to `true`. |
| `collapsible?` | `boolean` | Determines if the group can be collapsed in the navigation sidebar. |
| `folderPath?` | `string` |  The corresponding markdown folder location for the group. This defaults to `content/{tabTitle?}/{groupTitle}`. |
| `combineHref?` | `boolean` | Determines if the group title will be used in the link. |
| `private?` | `boolean \| TRole \| TRole[]` | Determines if this group and its pages require auth. Read the [auth guide](/docs/guides/auth) for more info. |
| `pages` | `PageItems<TRole> \| 'auto'` | A list of pages to include in the group. |

### Defining Pages

`Pages` can only be defined alone, but they can be created inside `Tabs` and `Groups`. Below is an example of defined `Pages`:

```ts title="Pages-Navigation-Example.ts"
const docNavigationConfig = defineDocNavigation({
	pages: [ // define pages or use 'auto' to load from file system.
		{ title: 'Introduction', icon: 'book-open-check', href: '/docs' },
		{ title: 'Quick Start', icon: 'rocket' },
		'loadRest' // you can use 'loadRest' to define some pages and load the rest from the file system.
	]
});
```

#### Page Options

Below are the options used directly in the `docNavigationConfig` for `Pages`:

| Option | Type | Description |
| --- | --- | --- |
| `pages` | `DocPage<TRole>[] \| 'auto'` | A list of pages to include in the docs navigation. If `"auto"`, pages are generated from the filesystem. |

Below are the options for the `pages` option from the above table:

| Option | Type | Description |
| --- | --- | --- |
| `title` | `string` | The name of the page displayed in the navigation sidebar. |
| `icon?` | `string` |  The icon displayed next to the title of a page in the navigation sidebar. |
| `href?` | `Pathname` | The href of the page. This defaults to the page title. |
| `filename?` | `string` | The corresponding markdown file location for the page. This defaults to `content/{tabTitle?}/{groupTitle?}/{pagetitle}`. | 
| `private?` | `boolean \| TRole \| TRole[]` | Determines if this page requires auth. Read the [auth guide](/docs/guides/auth) for more info. |