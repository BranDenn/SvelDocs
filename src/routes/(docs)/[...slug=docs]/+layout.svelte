<script lang="ts">
	import Header from '$components/header';
	import { enhance } from '$app/forms';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import Loader from '@lucide/svelte/icons/loader-circle';
	import * as Sidebar from '$ui/sidebar';
	import Icon from '$components/icon';
	import type {
		DocSidebarGroup,
		DocSidebarPage,
		DocSidebarTab,
		DocTabLink
	} from '$lib/server/content/docs-loader';
	import {
		setDocNavigationContext,
		type DocNavigationParams
	} from '$lib/doc-navigation-context.svelte';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { cn } from '$utils';

	let {
		data,
		children
	}: {
		data: { tabs?: DocTabLink[]; sidebarTabs?: DocSidebarTab[]; emulated?: boolean };
		children?: Snippet;
	} = $props();

	let isLoading = $state(false);

	const emptyNavigationParams: DocNavigationParams = {
		tabs: [],
		groups: [],
		pages: []
	};

	const docNavigation = setDocNavigationContext(emptyNavigationParams);

	function toId(value: string): string {
		return value
			.trim()
			.toLowerCase()
			.replaceAll(/[^a-z0-9\s-]/g, '')
			.replaceAll(/\s+/g, '-')
			.replaceAll(/-+/g, '-');
	}

	const navigationParams = $derived.by(() => {
		const tabs: DocNavigationParams['tabs'] = [];
		const groups: DocNavigationParams['groups'] = [];
		const pages: DocNavigationParams['pages'] = [];

		for (const [tabIndex, tab] of (data.sidebarTabs ?? []).entries()) {
			const tabId = `tab:${tab.href}:${tabIndex}`;
			tabs.push({
				id: tabId,
				title: tab.title,
				icon: tab.icon,
				href: tab.href,
				mode: tab.mode
			});

			if (tab.mode === 'group') {
				for (const [groupIndex, group] of (tab.data as DocSidebarGroup[]).entries()) {
					const groupId = `group:${tabId}:${toId(group.title) || groupIndex}`;

					groups.push({
						id: groupId,
						title: group.title,
						tabId,
						icon: group.icon,
						showTitle: group.showTitle,
						collapsible: group.collapsible
					});

					for (const pageItem of group.pages) {
						pages.push({
							href: pageItem.href,
							title: pageItem.title,
							tabId,
							groupId,
							icon: pageItem.icon
						});
					}
				}
			} else {
				for (const pageItem of tab.data as DocSidebarPage[]) {
					pages.push({
						href: pageItem.href,
						title: pageItem.title,
						tabId,
						icon: pageItem.icon
					});
				}
			}
		}

		return { tabs, groups, pages };
	});

	$effect(() => {
		docNavigation.update(navigationParams);
	});

	const currentSidebarTab = $derived.by(() => {
		const sidebarTabs = data.sidebarTabs ?? [];
		const currentTabId = docNavigation.currentTab?.id;
		if (!currentTabId) return sidebarTabs[0] ?? null;

		const tabIndex = navigationParams.tabs.findIndex((tab) => tab.id === currentTabId);
		return tabIndex >= 0 ? (sidebarTabs[tabIndex] ?? null) : (sidebarTabs[0] ?? null);
	});

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<Header tabs={data.tabs ?? []} activeTabHref={docNavigation.currentTab?.href ?? null} />


<div class="relative container flex grow">
	<div
		class="from-accent/10 pointer-events-none absolute inset-0 z-20 max-h-256 bg-radial-[50%_50%_at_50%_0%]"
	></div>

		<Sidebar.Root
			class={cn(
				'hidden border-r lg:block bg-background',
				'top-[calc(var(--spacing-header)+1px)] h-[calc(100dvh-var(--spacing-header)-1px)]',
				data.tabs
					? 'top-[calc(var(--spacing-header)*2+1px)] h-[calc(100dvh-var(--spacing-header)*2-1px)]'
					: ''
			)}
		>
			<div
				class="from-background pointer-events-none sticky top-0 z-10 h-4 shrink-0 bg-linear-to-b"
			></div>
			<Sidebar.Content class="">
				{#if currentSidebarTab}
					{#if currentSidebarTab.mode === 'group'}
						{@const navGroups = currentSidebarTab.data as DocSidebarGroup[]}
						{#each navGroups as navGroup (navGroup.title)}
							{#if navGroup.showTitle}
								<Sidebar.Group collapsible={navGroup.collapsible} class="gap-2">
									<Sidebar.GroupLabel>
										{navGroup.title}
									</Sidebar.GroupLabel>
									<Sidebar.Menu>
										{#each navGroup.pages as pageItem (pageItem.href)}
											<Sidebar.MenuItem>
												<Sidebar.MenuButton href={pageItem.href} isActive={isActive(pageItem.href)}>
													{#if pageItem.icon}
														<Icon name={pageItem.icon} class="size-4 shrink-0" />
													{/if}
													{pageItem.title}
												</Sidebar.MenuButton>
											</Sidebar.MenuItem>
										{/each}
									</Sidebar.Menu>
								</Sidebar.Group>
							{:else}
								<Sidebar.Menu>
									{#each navGroup.pages as pageItem (pageItem.href)}
										<Sidebar.MenuItem>
											<Sidebar.MenuButton href={pageItem.href} isActive={isActive(pageItem.href)}>
												{#if pageItem.icon}
													<Icon name={pageItem.icon} class="size-4 shrink-0" />
												{/if}
												{pageItem.title}
											</Sidebar.MenuButton>
										</Sidebar.MenuItem>
									{/each}
								</Sidebar.Menu>
							{/if}
						{/each}
					{:else}
						{@const navPages = currentSidebarTab.data as DocSidebarPage[]}
						<Sidebar.Menu>
							{#each navPages as navPage (navPage.href)}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton href={navPage.href} isActive={isActive(navPage.href)}>
										{#if navPage.icon}
											<Icon name={navPage.icon} class="size-4 shrink-0" />
										{/if}
										{navPage.title}
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{/each}
						</Sidebar.Menu>
					{/if}
				{:else}
					<Sidebar.Menu></Sidebar.Menu>
				{/if}
			</Sidebar.Content>
			<div class="pointer-events-none sticky bottom-0">
				<div
					class="from-background z-10 h-4 shrink-0 bg-linear-to-t"
				></div>
				<form
					method="POST"
					action="/?/toggleEmulated"
					use:enhance={() => {
						isLoading = true;
						return async ({ update }) => {
							await update();
							isLoading = false;
						};
					}}
					class="bg-background border-t border-border p-2 mt-auto pointer-events-auto"
				>
					<input type="hidden" name="enabled" value={!(data.emulated ?? false)} />
					<button
						type="submit"
						class="flex w-full items-center justify-between gap-3 rounded hover:bg-accent/10 px-2 py-1.5 transition-colors"
						disabled={isLoading}
					>
						<span class="text-sm font-medium">Emulate Admin</span>
						{#if isLoading}
							<Loader class="h-5 w-5 animate-spin" />
						{:else}
							<CheckCircle2
								class="h-5 w-5 transition-opacity"
								style={`opacity: ${(data.emulated ?? false) ? 1 : 0.4}`}
							/>
						{/if}
					</button>
				</form>
			</div>
			
		</Sidebar.Root>

	<div class="flex w-full min-w-0 flex-col wrap-break-word">
		<div
			class="from-background top-mobile-header lg:top-desktop-header pointer-events-none sticky z-10 h-8 shrink-0 bg-linear-to-b transition-[top] duration-300"
		></div>
		<div
			id="content-area"
			class="flex grow flex-col gap-8 px-4 transition-[padding] md:px-14 lg:py-6"
		>
			{#if isLoading}
				<div class="flex grow items-center justify-center">
					<Loader class="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			{:else}
				<main class="grow">
					{@render children?.()}
				</main>
			{/if}
		</div>
		<div
			class="from-background pointer-events-none sticky bottom-0 z-10 h-8 shrink-0 bg-linear-to-t"
		></div>
	</div>
</div>
