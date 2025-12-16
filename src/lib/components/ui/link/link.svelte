<script lang="ts">
	import { resolve } from '$app/paths';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let { href, children, ...restProps }: HTMLAnchorAttributes = $props();

	const hasSlash = $derived(href?.startsWith('/'));
	const hasHash = $derived(href?.startsWith('#'));
	const isExternal = $derived(!hasSlash && !hasHash);
	const target = $derived(isExternal ? '_blank' : undefined);
	const rel = $derived(isExternal ? 'noopener noreferrer' : undefined);
</script>

<a href={hasSlash ? resolve(`${href}`) : href} {target} {rel} {...restProps}>
	{@render children?.()}
</a>
