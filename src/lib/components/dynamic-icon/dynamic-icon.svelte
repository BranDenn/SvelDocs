<script lang="ts">
	import type { Component } from 'svelte';
	import type { IconProps } from '@lucide/svelte';
	import { cn } from '$utils';
	import IconManifest from '$lib/docs/navigation/icon-manifest';

	type Props = {
		name: string;
	} & IconProps;

	let { name, class: className, ...restProps }: Props = $props();

	async function getIcon(n: string) {
		if (!(n in IconManifest)) return;

		const f = IconManifest[n];
		const i = await f();
		return i.default as Component<IconProps, {}, ''>;
	}
</script>

{#await getIcon(name)}
	<!-- Optional: Placeholder while the icon is loading -->
	<div class={cn('bg-primary size-4 shrink-0 rounded border', className)}></div>
{:then Icon}
	<!-- Render the imported component -->
	<Icon class={cn('size-4 shrink-0', className)} {...restProps} />
{:catch}
	<!-- Optional: Handle cases where the icon name is invalid or the import fails -->
	<span class={cn('size-4 shrink-0', className)}>{name}</span>
{/await}
