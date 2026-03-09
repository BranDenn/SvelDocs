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
	import {
		getDocNavigationContext,
		type Page,
		type GroupedPages
	} from '$lib/docs/navigation/doc-navigation-context.svelte';
	import Icon from '$components/icon';

	let { class: className }: { class?: ClassValue } = $props();

	const docNavigationContext = getDocNavigationContext();
</script>

{#snippet group(title: string, iconValue?: Component | string)}
	{#if iconValue}
		<!-- {#if typeof Icon === 'string'}
			<span class="size-4 shrink-0">{Icon}</span>
		{:else}
			<Icon class="size-4 shrink-0" />
		{/if} -->
		{#if typeof iconValue === 'string'}
			<Icon name={iconValue} />
		{:else}
			<iconValue class="size-4 shrink-0"></iconValue>
		{/if}
	{/if}
	{title}
{/snippet}

<nav class={cn('flex grow flex-col gap-4 px-4 text-sm', className)}>
	{#if docNavigationContext.mode === 'page'}
		<ul class="flex flex-col">
			{#each docNavigationContext.data as Page[] as { title, href, icon }, i (i)}
				<li class="flex">
					<Link {title} {href} {icon} class="w-full" />
				</li>
			{/each}
		</ul>
	{/if}

	{#if docNavigationContext.mode === 'group'}
		{#each docNavigationContext.data as GroupedPages[] as { title, icon, pages, show }, i (i)}
			{#if show !== false && SETTINGS.COLLAPSIBLE_NAV_GROUPS}
				<Collapsible.Root open={true}>
					<Collapsible.Trigger class="group flex w-full items-center gap-2 px-4 font-semibold">
						{@render group(title, icon)}
						<ChevronRight
							class="ml-auto size-[1.2em] transition-transform group-data-[state=open]:rotate-90"
						/>
					</Collapsible.Trigger>
					<Collapsible.Content class="mt-2 flex flex-col">
						{#snippet child({ props, open })}
							{#if open}
								<ul {...props} transition:slide={{ duration: 150 }}>
									{#each pages as { title, href, icon } (href)}
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
					{#if show !== false}
						<h2 class="mb-2 flex w-full items-center gap-2 px-4 font-semibold">
							{@render group(title, icon)}
						</h2>
					{/if}
					{#each pages as { title, href, icon } (href)}
						<li class="flex">
							<Link {title} {href} {icon} class="w-full" />
						</li>
					{/each}
				</ul>
			{/if}
		{/each}
	{/if}

	<!-- {#each NAVIGATION as nav, i (i)}
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
	{/each} -->
</nav>
