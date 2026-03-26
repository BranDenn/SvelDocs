---
description: How to define the look and structure of document navigation such for tabs, groups, pages, routing, access, etc.
---

## File Locations

Navigation configuration lives in two places:

- `src/lib/server/navigation/define-doc-navigation.ts`
- `src/lib/server/navigation/doc-navigation.config.ts`

`define-doc-navigation.ts` provides strong types, validation, and `defineDocNavigation(...)`.

`doc-navigation.config.ts` is where you declare your actual docs structure.

## Root Modes

The root config supports exactly one mode:

- `tabs`
- `groups`
- `pages`

The project currently uses `tabs` mode.

## Tabs, Groups, and Pages

You can define docs manually, auto-generate from filesystem, or mix both:

- `tabs: 'auto'` or array
- `groups: 'auto'` or array
- `pages: 'auto'` or array

At group and tab levels, you can also provide explicit items and finish with `'loadRest'` to append remaining files.

Example:

```ts
pages: [
	{ title: 'Introduction', href: '/docs' },
	'loadRest'
]
```

`'loadRest'` is validated so it can only appear once and must be last.

## Routing Behavior

If `href` is not provided for a page, links are generated from title segments.

Generated paths are influenced by:

- `tab.combineHref`
- `group.combineHref`

Defaults:

- Tab titles are included in paths unless `combineHref: false`
- Group titles are included in paths unless `combineHref: false`

You can always override with explicit `href` on a page.

## Filesystem Mapping

You can override markdown file locations with:

- `tab.folderPath`
- `group.folderPath`
- `page.fileName`

Defaults are derived from normalized tab/group/page titles.

## Access Control

Each tab, group, or page can define `private`:

- `false` or omitted: public
- `true`: authenticated users
- `'role'`: role-restricted
- `['roleA', 'roleB']`: any listed role

Access inherits down from tab -> group -> page, with child values overriding parent values.

## Icons and Metadata

`icon` can be set on tabs, groups, and pages. It is used in navigation/search display when provided.

## Current Project Config

Edit `src/lib/server/navigation/doc-navigation.config.ts` to change the structure users see in the docs sidebar/header.

That config is consumed by the docs manifest builder in `plugins/processed-docs/collect-doc-entries.ts`.
