<script lang="ts">
	import type { Component } from 'svelte';
	import type { IconProps } from '@lucide/svelte';
	import { cn } from '$utils';
	import IconManifest from 'virtual:doc-icon-manifest';

	type Props = {
		name: string;
	} & IconProps;

	let { name, class: className, ...restProps }: Props = $props();
	let icon = $derived.by(() => {
		if (!(name in IconManifest)) {
			console.warn(`[doc-icon-manifest] Icon key not found in manifest: ${name}`);
			return undefined;
		}

		return IconManifest[name] as Component<IconProps, {}, ''> | undefined;
	});
</script>

{#if icon}
	{@const Icon = icon}
	<Icon class={cn('size-4 shrink-0', className)} {...restProps} />
{:else}
	<span class={cn('size-4 shrink-0', className)}>{name}</span>
{/if}
