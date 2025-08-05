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
