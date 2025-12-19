<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let { href, children, ...restProps }: HTMLAnchorAttributes = $props();

	const hasSlash = $derived(href?.startsWith('/'));
	const hasHash = $derived(href?.startsWith('#'));
	const isExternal = $derived(!hasSlash && !hasHash);
	const target = $derived(isExternal ? '_blank' : undefined);
	const rel = $derived(isExternal ? 'external noopener noreferrer' : undefined);
	const resolvedHref = $derived(hasSlash ? resolve(href as Pathname) : href);
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
<a href={resolvedHref} {target} {rel} {...restProps}>
	{@render children?.()}
</a>
