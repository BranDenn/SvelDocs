<script lang="ts">
	import { resolve } from '$app/paths';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let { href, children, ...restProps }: HTMLAnchorAttributes = $props();

	const isExternal = !href?.startsWith('/') && !href?.startsWith('#');
	const target = isExternal ? '_blank' : undefined;
	const rel = isExternal ? 'noopener noreferrer' : undefined;
</script>

<a href={isExternal ? href : resolve(`/${href}`)} {target} {rel} {...restProps}>
	{@render children?.()}</a
>
