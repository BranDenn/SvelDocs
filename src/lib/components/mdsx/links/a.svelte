<script lang="ts">
	import { page } from '$app/state';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let { href, children, ...restProps }: HTMLAnchorAttributes = $props();

	const isExternal = !href?.startsWith('/') && !href?.startsWith('#');
	const target = isExternal ? '_blank' : undefined;
</script>

<a
	{href}
	{target}
	{...restProps}
	class={[isExternal && 'inline-flex items-center gap-1', 'text-accent underline']}
>
	{@render children?.()}{#if isExternal}<ExternalLink class="size-[1em]" />{/if}</a
>
