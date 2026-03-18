---
description: Simple server-side auth filtering for docs using locals and canAccessDoc.
---

## Goal

SvelDocs already has a small access-control hook for documentation pages. The pattern is:

1. put auth state on `event.locals`
2. read `locals` in the docs server routes
3. filter docs with `canAccessDoc(...)`

This keeps private docs out of navigation, search, page loads, and the raw markdown endpoint.

## The Existing Starter Flow

The starter currently uses a simple boolean flag.

In `src/hooks.server.ts`, a cookie is read and stored on `locals`:

```ts
import { type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const emulatedAdminCookie = event.cookies.get('emulated-admin');
	event.locals.emulated = emulatedAdminCookie === 'true';

	const response = await resolve(event);
	return response;
};
```

The local type is declared in `src/app.d.ts`:

```ts
interface Locals {
	emulated: boolean;
}
```

That value is then used in the docs routes:

- `src/routes/(docs)/[...slug=docs]/+layout.server.ts`
- `src/routes/(docs)/[...slug=docs]/+page.server.ts`
- `src/routes/(docs)/[...slug=docs].md/+server.ts`

Each route passes the local auth value into `src/lib/server/content/docs-access.ts`.

## The Access Helper

`canAccessDoc(...)` supports four access modes:

- omitted or `false` for public docs
- `true` for any authenticated user
- `'admin'` for a single role
- `['admin', 'editor']` for multiple allowed roles

That logic lives in `src/lib/server/content/docs-access.ts`.

## Marking Docs As Private

You can mark access in your navigation config or per document metadata, depending on how you want to model the content.

The navigation types support `private` on tabs, groups, and pages in `src/lib/server/navigation/define-doc-navigation.ts`.

Example:

```ts
{
	title: 'Billing',
	private: true
}

{
	title: 'Admin Only',
	private: 'admin'
}

{
	title: 'Team Docs',
	private: ['admin', 'editor']
}
```

## Replacing The Demo Cookie With Real Auth

For a real project, replace the demo cookie check in `src/hooks.server.ts` with your actual session logic.

Typical examples:

- read a signed session cookie
- validate a bearer token
- load the user from your auth provider
- place a boolean or role string on `event.locals`

Simple boolean auth:

```ts
event.locals.emulated = Boolean(session?.user);
```

Role-based auth:

```ts
event.locals.emulated = session?.user?.role ?? false;
```

Because `canAccessDoc(...)` accepts either a boolean or a role string, both patterns work.

## Filtering Navigation Server-Side

The docs layout load already filters navigation and search data before the page renders:

```ts
const { navigation, searchGroups } = getDocLayoutData((doc) =>
	canAccessDoc(locals.emulated, doc.private)
);
```

That means hidden docs do not just disappear from the page body. They are also removed from sidebar and search results.

## One Important Limitation

If you deploy with static generation, protected pages must not be emitted into the final build output.

Use the auth filtering pattern with SSR when docs depend on the current user. Keep SSG for fully public documentation.
