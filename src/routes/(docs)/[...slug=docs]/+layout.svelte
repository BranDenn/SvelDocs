<script lang="ts">
	import Header from '$components/header';
	import {
		Sidebar,
		SidebarContent,
		SidebarGroup,
		SidebarGroupLabel,
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem
	} from '$ui/sidebar';
	import type {
		DocSidebarGroup,
		DocSidebarPage,
		DocSidebarTab,
		DocTabLink
	} from '$lib/server/content/docs-loader';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { cn } from '$utils';

	let {
		data,
		children
	}: {
		data: { tabs?: DocTabLink[]; sidebarTabs?: DocSidebarTab[] };
		children?: Snippet;
	} = $props();

	const currentSidebarTab = $derived.by(() => {
		const sidebarTabs = data.sidebarTabs ?? [];
		const pathname = page.url.pathname;

		const matches = sidebarTabs.filter(
			(tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`)
		);

		if (matches.length > 0) {
			return matches.toSorted((a, b) => b.href.length - a.href.length)[0] ?? null;
		}

		return sidebarTabs[0] ?? null;
	});

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<Header tabs={data.tabs ?? []} />

<div class="relative container flex grow">
	<div
		class="from-accent/10 pointer-events-none absolute inset-0 z-20 max-h-256 bg-radial-[50%_50%_at_50%_0%]"
	></div>

	{#if currentSidebarTab}
		<Sidebar
			class={cn(
				'hidden border-r lg:block',
				'top-[calc(var(--spacing-header)+1px)] h-[calc(100dvh-var(--spacing-header)-1px)]',
				data.tabs
					? 'top-[calc(var(--spacing-header)*2+1px)] h-[calc(100dvh-var(--spacing-header)*2-1px)]'
					: ''
			)}
		>
			<SidebarContent class="">
				{#if currentSidebarTab.mode === 'group'}
					{@const navGroups = currentSidebarTab.data as DocSidebarGroup[]}
					{#each navGroups as navGroup (navGroup.title)}
						{#if navGroup.showTitle}
							<SidebarGroup collapsible={navGroup.collapsible} class="gap-2">
								<SidebarGroupLabel class="cursor-pointer px-2 py-1.5 text-sm font-semibold">
									{navGroup.title}
								</SidebarGroupLabel>
								<SidebarMenu>
									{#each navGroup.pages as pageItem (pageItem.href)}
										<SidebarMenuItem>
											<SidebarMenuButton href={pageItem.href} isActive={isActive(pageItem.href)}>
												{pageItem.title}
											</SidebarMenuButton>
										</SidebarMenuItem>
									{/each}
									{#each Array(50) as _, i}
										<SidebarMenuItem>
											<SidebarMenuButton>
												{i}
											</SidebarMenuButton>
										</SidebarMenuItem>
									{/each}
								</SidebarMenu>
							</SidebarGroup>
						{:else}
							<SidebarMenu>
								{#each navGroup.pages as pageItem (pageItem.href)}
									<SidebarMenuItem>
										<SidebarMenuButton href={pageItem.href} isActive={isActive(pageItem.href)}>
											{pageItem.title}
										</SidebarMenuButton>
									</SidebarMenuItem>
								{/each}
							</SidebarMenu>
						{/if}
					{/each}
				{:else}
					{@const navPages = currentSidebarTab.data as DocSidebarPage[]}
					<SidebarMenu>
						{#each navPages as navPage (navPage.href)}
							<SidebarMenuItem>
								<SidebarMenuButton href={navPage.href} isActive={isActive(navPage.href)}>
									{navPage.title}
								</SidebarMenuButton>
							</SidebarMenuItem>
						{/each}
					</SidebarMenu>
				{/if}
			</SidebarContent>
		</Sidebar>
	{/if}

	<div class="flex w-full min-w-0 flex-col wrap-break-word">
		<div
			class="from-background top-mobile-header lg:top-desktop-header pointer-events-none sticky z-10 h-8 shrink-0 bg-linear-to-b transition-[top] duration-300"
		></div>
		<div
			id="content-area"
			class="flex grow flex-col gap-8 px-4 transition-[padding] md:px-14 lg:py-6"
		>
			<main class="grow">
				{@render children?.()}
			</main>
		</div>
		<div
			class="from-background pointer-events-none sticky bottom-0 z-10 h-8 shrink-0 bg-linear-to-t"
		></div>
	</div>
</div>
