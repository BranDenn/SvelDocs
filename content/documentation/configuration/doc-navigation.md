---
description: How to define the look and structure of document navigation such for tabs, groups, pages, routing, access, etc.
---

import Alert from '$ui/alert';

## Overview

Navigation configuration can be configured in the `$lib/server/navigation/doc-navigation.config.ts` file. It uses a `defineDocNavigation` helper function to provide strong type safety for all of the options.

## Tabs, Groups, and Pages

The config supports multiple "modes":

- `Tabs`: Categorizes `Groups` / `Pages` and displays the tabs in the header for `/docs` routes.
- `Groups`: Categorizes `Pages` and displays the groups in the sidebar for `/docs` routes.
- `Pages`: Refers to your actualy markdown pages.

<Alert type="note">
	The `docNavigationConfig` requires a certain hierachy for the "modes" as follows: `Tabs > Groups > Pages`. For example, `Tabs` can have `Groups`, but `Groups` cannot have `Tabs`. The `defineDocNavigation` function helps with type safety.
</Alert>

### Defining Tabs

`Tabs` can have both `Groups` and `Pages`. Below is an example of defined `Tabs`:

```ts title="Tab-Navigation-Example.ts"
const docNavigationConfig = defineDocNavigation<Roles>({
	tabNextPrev: true, // allows next and previous buttons on a page to go to next tabs
	tabs: [
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

| Option | Type | Descrtiption |
| --- | --- | --- |
| `title` | `string` | The name of the tab. This is displayed in the header. |
| `icon?` | `string` |  The icon to display next to the title of a tab. |
| `folderPath?` | `string` |  The corresponding markdown folder location for the tab. This defaults to `content/{tabTitle}` but can be overridden. |
| `combineHref?` | `boolean` | Determines if the tab title will name will used in the link.
| `private?` | `boolean \| TRole \| TRole[]` | Determines if this tab and its groups/pages require authentication/authorization. |
| `pages?` | `PageItems<TRole> \| 'auto'` | A list of pages to include in the tab. Cannot be used if groups is defined. |
| `groups?` | `DocGroup<TRole>[] \| 'auto'` | A list of groups to include in the tab. Cannot be used if pages is defined. |

### Defining Groups

`Groups` can only have `Pages`, but they can be created inside `Tabs`. Below is an example of defined `Groups`:

```ts title="Group-Navigation-Example.ts"
const docNavigationConfig = defineDocNavigation<Roles>({
	groups: [
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

### Defining Pages

`Pages` can only be defined alone, but they can be created inside `Tabs` and `Groups`. Below is an example of defined `Pages`:

```ts title="Pages-Navigation-Example.ts"
const docNavigationConfig = defineDocNavigation<Roles>({
	pages: [
		{ title: 'Introduction', icon: 'book-open-check', href: '/docs' },
		{ title: 'Quick Start', icon: 'rocket' }
	]
});
```

#### Page Options