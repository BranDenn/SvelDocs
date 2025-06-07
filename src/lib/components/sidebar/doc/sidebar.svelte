<script lang="ts">
	import Sidebar from '../sidebar.svelte';
	import Link from './link.svelte';
	import { Collapsible } from 'bits-ui';
	import { NAVIGATION } from '$settings';
	import { SETTINGS } from '$settings';
	import { slide } from 'svelte/transition';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { SearchBox } from '$lib/components/search';
</script>

<Sidebar
	class="scrollbar min-w-sidebar-nav hidden flex-col overflow-y-auto overscroll-contain border-r md:flex"
>
	{#if SETTINGS.SEARCH_BAR_LOCATION === 'sidebar'}
		<div class="sticky top-0">
			<div class="bg-background px-8 pt-8">
				<SearchBox />
			</div>
			<div class="from-background h-8 bg-linear-to-b"></div>
		</div>
	{:else}
		<div class="from-background sticky top-0 bg-linear-to-b p-4"></div>
	{/if}

	<nav class="flex grow flex-col gap-8 px-8 text-sm">
		{#each NAVIGATION as nav}
			<div class="flex flex-col">
				{#if nav.show && SETTINGS.COLLAPSIBLE_NAV_GROUPS && nav.items.length}
					<Collapsible.Root open={true}>
						<Collapsible.Trigger
							class="group flex w-full items-center justify-between font-semibold"
						>
							{nav.group}
							<ChevronRight class="size-4 transition-transform group-data-[state=open]:rotate-90" />
						</Collapsible.Trigger>
						<Collapsible.Content forceMount class="mt-2 flex flex-col">
							{#snippet child({ props, open })}
								{#if open}
									<div {...props} transition:slide={{ duration: 150 }}>
										{#each nav.items as { title, href, icon }}
											<Link {title} {href} {icon} />
										{/each}
									</div>
								{/if}
							{/snippet}
						</Collapsible.Content>
					</Collapsible.Root>
				{:else}
					{#if nav.show}
						<h1 class="mb-2 font-semibold">{nav.group}</h1>
					{/if}
					{#each nav.items as { title, href, icon }}
						<Link {title} {href} {icon} />
					{/each}
				{/if}
			</div>
		{/each}
	</nav>

	<div class="from-background sticky bottom-0 bg-linear-to-t p-4"></div>
</Sidebar>
