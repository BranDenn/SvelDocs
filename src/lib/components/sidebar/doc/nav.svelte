<script lang="ts">
	import Link from './link.svelte';
	import { Collapsible } from 'bits-ui';
	import { NAVIGATION } from '$lib/docs/docs.config';
	import { SETTINGS } from '$lib/docs/docs.config';
	import { slide } from 'svelte/transition';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { ClassValue } from 'svelte/elements';
	import { cn } from '$utils';
	import { type Component } from 'svelte';

	let { class: className }: { class?: ClassValue } = $props();
</script>

{#snippet group(title: string, Icon?: Component | string)}
	{#if Icon}
		{#if typeof Icon === 'string'}
			<span class="size-4 shrink-0">{Icon}</span>
		{:else}
			<Icon class="size-4 shrink-0" />
		{/if}
	{/if}
	{title}
{/snippet}

<nav class={cn('flex grow flex-col gap-4 px-4 text-sm', className)}>
	{#each NAVIGATION as nav, i (i)}
		{#if i > 0}
			<hr />
		{/if}
		{#if nav.show && SETTINGS.COLLAPSIBLE_NAV_GROUPS && nav.items.length}
			<Collapsible.Root open={true}>
				<Collapsible.Trigger class="group flex w-full items-center gap-2 px-4 font-semibold">
					{@render group(nav.group, nav.icon)}
					<ChevronRight
						class="ml-auto size-[1.2em] transition-transform group-data-[state=open]:rotate-90"
					/>
				</Collapsible.Trigger>
				<Collapsible.Content forceMount class="mt-2 flex flex-col">
					{#snippet child({ props, open })}
						{#if open}
							<ul {...props} transition:slide={{ duration: 150 }}>
								{#each nav.items as { title, href, icon } (href)}
									<li class="flex">
										<Link {title} {href} {icon} class="w-full" />
									</li>
								{/each}
							</ul>
						{/if}
					{/snippet}
				</Collapsible.Content>
			</Collapsible.Root>
		{:else}
			<ul class="flex flex-col">
				{#if nav.show}
					<h2 class="mb-2 flex w-full items-center gap-2 px-4 font-semibold">
						{@render group(nav.group, nav.icon)}
					</h2>
				{/if}
				{#each nav.items as { title, href, icon } (href)}
					<li class="flex">
						<Link {title} {href} {icon} class="w-full" />
					</li>
				{/each}
			</ul>
		{/if}
	{/each}
</nav>
