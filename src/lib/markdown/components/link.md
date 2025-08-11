---
description: Component replacing the typical <a> tag.
---

## Reasoning

A custom Link component was created for reusability due to two concerns:

1. Resolving internal links in the case that a custom base path was set in the `svelte.config.ts`.
    - This is neccessary for use with GitHub pages.
    - The resolve function can be read about more [here](https://svelte.dev/docs/kit/$app-paths#resolve)
2. Ensuring external links open in a new tab.

## Code

```svelte showLineNumbers
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let { href, children, ...restProps }: HTMLAnchorAttributes = $props();

	const hasSlash = href?.startsWith('/');
	const hasHash = href?.startsWith('#');
	const isExternal = !hasSlash && !hasHash;
	const target = isExternal ? '_blank' : undefined;
	const rel = isExternal ? 'noopener noreferrer' : undefined;
</script>

<a href={hasSlash ? resolve(`/${href}`) : href} {target} {rel} {...restProps}>
	{@render children?.()}</a
>
```