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
		DocSidebarTab
	} from '$lib/server/content/docs-loader';
	import {
		setDocNavigationContext,
		type DocNavigationParams
	} from '$lib/doc-navigation-context.svelte';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { cn } from '$utils';
	import { untrack } from 'svelte';

	let {
		data,
		children
	}: {
		data: {
			sidebarTabs?: DocSidebarTab[];
			navigationParams?: DocNavigationParams;
			emulated?: boolean;
		};
		children?: Snippet;
	} = $props();

	let isLoading = $state(false);
	const EMPTY_NAVIGATION_PARAMS: DocNavigationParams = { tabs: [], groups: [], pages: [] };

	const initialNavigationParams = untrack(() => data.navigationParams ?? EMPTY_NAVIGATION_PARAMS);
	let lastNavigationParamsKey = JSON.stringify(initialNavigationParams);

	const docNavigation = setDocNavigationContext(initialNavigationParams);

	$effect(() => {
		const nextNavigationParams = data.navigationParams ?? EMPTY_NAVIGATION_PARAMS;
		const nextKey = JSON.stringify(nextNavigationParams);

		if (nextKey === lastNavigationParamsKey) {
			return;
		}

		lastNavigationParamsKey = nextKey;
		docNavigation.update(nextNavigationParams);
	});

	const currentSidebarTab = $derived.by(() => {
		const sidebarTabs = data.sidebarTabs ?? [];
		const currentTabId = docNavigation.currentTab?.id;
		if (!currentTabId) return sidebarTabs[0] ?? null;

		const navigationTabs = data.navigationParams?.tabs ?? [];
		const tabIndex = navigationTabs.findIndex((tab) => tab.id === currentTabId);
		return tabIndex >= 0 ? (sidebarTabs[tabIndex] ?? null) : (sidebarTabs[0] ?? null);
	});

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<Header />

<div class="relative container flex grow">
	<div
		class="from-accent/10 top-0 pointer-events-none absolute inset-0 z-20 h-[50dvh] bg-radial-[50%_50%_at_50%_0%]"
	></div>

	<Sidebar.Root
		class={cn(
			'bg-background hidden border-r lg:block',
			docNavigation.tabs.length > 0
				? 'top-[calc(var(--spacing-header)*2+1px)] h-[calc(100dvh-var(--spacing-header)*2-1px)]'
				: 'top-[calc(var(--spacing-header)+1px)] h-[calc(100dvh-var(--spacing-header)-1px)]'
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
							<Sidebar.Group collapsible={navGroup.collapsible}>
								<Sidebar.GroupLabel>
									{#if navGroup.icon}
										<Icon name={navGroup.icon} />
									{/if}
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
			<div class="from-background z-10 h-4 shrink-0 bg-linear-to-t"></div>
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
				class="bg-background border-border pointer-events-auto mt-auto border-t p-2"
			>
				<input type="hidden" name="enabled" value={!(data.emulated ?? false)} />
				<button
					type="submit"
					class="group hover:bg-accent/10 flex w-full items-center gap-2 rounded px-2 py-1.5 transition-colors"
					disabled={isLoading}
				>
					<CheckCircle2
						class={cn('size-4 shrink-0', data.emulated ? 'text-accent' : 'text-muted-foreground')}
					/>
					<span class="text-sm font-medium">Emulate Admin</span>
					{#if isLoading}
						<Loader class="ml-auto size-4 shrink-0 animate-spin" />
					{/if}
				</button>
			</form>
		</div>
	</Sidebar.Root>

	<div class="flex w-full min-w-0 flex-col wrap-break-word">
		<div
			class={cn(
				'from-background pointer-events-none sticky z-10 h-8 shrink-0 bg-linear-to-b transition-[top] duration-300',
				docNavigation.tabs.length > 0
					? 'top-[calc(var(--spacing-header)*2+1px)]'
					: 'top-[calc(var(--spacing-header)*2+1px)] lg:top-[calc(var(--spacing-header)+1px)]'
			)}
		></div>
		<div
			id="content-area"
			class="flex grow flex-col gap-8 px-4 transition-[padding] md:px-14 lg:py-6"
		>
			{#if isLoading}
				<div class="flex grow items-center justify-center">
					<Loader class="text-muted-foreground size-8 shrink-0 animate-spin" />
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
