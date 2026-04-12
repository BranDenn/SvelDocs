---
description: How to run SvelDocs with server-side rendering and when to switch away from the static adapter.
---

import Alert from '$ui/alert';
import { Steps, Step } from '$ui/steps';

## When To Use SSR (Server Side Rendering)

Use server-side rendering when your docs need request-time behavior, such as Auth or other server-only data fetching:

SvelDocs already uses server load functions for the docs routes, so the main SSR change is your adapter and deployment target.

<Alert type="note">
	If you do not need any server side functionality, it is recommended to use [Static Site Generation](/docs/guides/static-site-generation).
</Alert>

## Configuration

The adapter is configured in `svelte.config.js`. The static adapter is the default, so replace it with the [adapter](https://svelte.dev/docs/kit/adapters) that matches your host.

```js title="svelte.config.js"
import adapter from '@sveltejs/adapter-auto';		  // [!code ++]
import adapterStatic from '@sveltejs/adapter-static'; // [!code --]

const config = {
	...
	kit: {
		adapter: adapterStatic({ // [!code --]
			fallback: '404.html' // [!code --]
		}),						 // [!code --]
		adapter: adapter()		 // [!code ++]
		...
	}
};
```

Common choices:

- `@sveltejs/adapter-auto` for platforms SvelteKit can detect automatically
- `@sveltejs/adapter-node` for your own Node server
- `@sveltejs/adapter-vercel` for Vercel
- `@sveltejs/adapter-netlify` for Netlify functions
- `@sveltejs/adapter-cloudflare` for Cloudflare

## Auth

SvelDocs does not implement auth directly because auth implementation is opinionated. However, SvelDocs includes role-based access control hooks for docs when you run SSR.

<Steps>
	<Step id="mark-private-navigation" title="Mark Tabs, Groups, Or Pages As Private">
		Use `private` on tabs, groups, or pages for the `docNavigationConfig`. `private` supports `boolean` | `string` | `string[]`. It is recommended to update the `type Roles` for type safety and auto complete. 

		```ts title="src/lib/docs/server/navigation/doc-navigation.config.ts"
		import { defineDocNavigation } from './define-doc-navigation';

		type Roles =  'member' | 'proMember';

		const docNavigationConfig = defineDocNavigation<Roles>({
			tabs: [
				{
					title: 'Member Documentation',
					private: true, // only logged in users can access this tab
					groups: [
						{
							title: 'Every Logged in User',
							pages: 'auto' // pages inherit tab `private`
						},
						{
							title: 'Only Paid Members',
							private: ['member', 'proMember'], // only paid members can access this group (overrides tab `private`)
							pages: [
								{ title: 'Member Info' }, // page inherits group `private`
								{ title: 'Pro Member Info', private: 'proMember' } // only pro members can access this page (overrides group `private`) 
							]
						}
					]
				}
			]
		});

		export default docNavigationConfig;
		```
	</Step>

	<Step id="add-auth-to-locals" title="Add User Auth State To event.locals">
		Create (or update) `src/hooks.server.ts` and set a boolean or role on locals.

		```ts title="hooks.server.ts"
		import type { Handle } from '@sveltejs/kit';

		export const handle: Handle = async ({ event, resolve }) => {
			// Replace this with your real session lookup
			const session = await event.locals.auth?.();

			// false = unauthenticated, otherwise a role string
			event.locals.userRole = session?.user?.role ?? false;

			return resolve(event);
		};
		```
	</Step>

	<Step id="update-docs-loaders" title="Update The Docs Route Server Functions">
		Update all docs server loaders/endpoints so they call `canAccessDoc(...)` with your locals value.

		```ts title="src/routes/(docs)/[...slug=docs]/+layout.server.ts"
		export const load: LayoutServerLoad = async ({ locals }) => {
			...

			const { navigation, searchGroups } = getDocLayoutData((doc) => canAccessDoc(locals.userRole, doc.private));

			...
		};
		```

		```ts title="src/routes/(docs)/[...slug=docs]/+page.server.ts"
		export const load: PageServerLoad = async ({ locals, params }) => {
			...

			if (!canAccessDoc(locals.userRole, docData.private)) {
				throw error(404, 'Document not found');
			}

			...
		};
		```

		```ts title="src/routes/(docs)/[...slug=docs].md/+server.ts"
		export const GET: RequestHandler = async ({ locals, params }) => {
			...

			if (!canAccessDoc(locals.userRole, docData.private)) {
				throw error(404, 'Document not found');
			}

			...
		};
		```
	</Step>
</Steps>