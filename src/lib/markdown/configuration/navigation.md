---
description: Customize the navigation groups, items, and routing.
---

## Problem

It is often very annoying setting up navigation with a lot of routes. The goto implementation is usually an array of objects like this:

```ts title="typical-implementation.ts"
export const NAVIGATION: [
    {
        href: '/docs/introduction',
        icon: ICON1,
        title: 'Introduction'
    },
    {
        href: '/docs/getting-started',
        icon: ICON2,
        title: 'Quick Start'
    }
    ...
];
```

## Solution

This navigation structure was made to be extremely simple and customizable. This can be configured in the `doc.config.ts` file.

```ts title="doc.config.ts"
export const NAVIGATION: NavGroup[] = [
	Group('Getting Started', { show: false, groupHref: false }).Items(
		{ title: 'Introduction', icon: BookOpenCheck, href: SETTINGS.REDIRECT_URL },
		{ title: 'Quick Start', icon: Rocket },
	),
	Group('Configuration').Items(),
	Group('Components').Items(),
	Group('Miscellaneous').Items()
];
```

##### Structure Explanation

As seen in the above example, only 2 items are defined, even though there are more than 2 markdown files.

Calling the `Items()` function after a group will automatically retrieve the markdown from the file system - meaning it will be listed alphabetically. However, the function can be overridden with specific items like the example above - the 2 items were manually defined as they needed a specific order, icon, and one href override.

The group has further parameters that can be configured, for example, the `{ show: false, groupHref: false }` from above. Read below to understand the parameters.

## API Reference

##### Group

A group is defined as `Group(groupName: string, params?: NavGroupParams)`.

The `groupName` is used for both grouping items in the documentation sidebar, and for routing.
The `params` is an optional parameter for changing some group options.

| Param | Type | Description | Default |
| ----- | ---- | ----------- | ------- |
| folder? | `string` | The markdown folder that the group corresponds to. | `{groupName}`<br>`.replaceAll(' ', '-')`<br>`.toLowerCase()`.
| show? | `boolean` | Whether or not the group name will be shown in the sidebar. | `true`
| groupHref? | `boolean` | Whether or not the group should be included in the routing. <br>If `true` a route looks like this: `/docs/{groupName}/{itemName}`. <br>If `false` a route looks like this: `/docs/{itemName}`. | `true`

##### Item

The `Item()` function must be called after a `Group()` to load the items. Leaving the parameters empty will load the markdown from the file system automatically. Any number of items can also be passed in as parameters for further control.

| Param | Type | Description | Default |
| ----- | ---- | ----------- | ------- |
| title | `string` | the name of the item that is displayed in the sidebar. | `{MarkdownFileName}`
| icon? | `Component` | the icon that is displayed next to the title. | `undefined`
| href? | `string` | the route that the item links to. | `/docs/{groupName?}/{title}`<br>`.replaceAll(' ', '-')`<br>`.toLowerCase()`