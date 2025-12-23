<script lang="ts">
	import type { Component } from 'svelte';
	import type { IconProps } from '@lucide/svelte';
	import { cn } from '$utils';

	type Props = {
		name: string;
	} & IconProps;

	let { name, class: className, ...restProps }: Props = $props();

	async function getIcon(n: string) {
		const i = await import(`@lucide/svelte/icons/${n.toLowerCase()}`);
		return i.default as Component<IconProps, {}, ''>;
	}
</script>

{#await getIcon(name)}
	<!-- Optional: Placeholder while the icon is loading -->
	<div class={cn('size-4 shrink-0', className)}></div>
{:then Icon}
	<!-- Render the imported component -->
	<Icon class={cn('size-4 shrink-0', className)} {...restProps} />
{:catch}
	<!-- Optional: Handle cases where the icon name is invalid or the import fails -->
	<span class={cn('size-4 shrink-0', className)}>{name}</span>
{/await}
