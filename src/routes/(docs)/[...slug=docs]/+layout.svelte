<script lang="ts">
	import './docs.css';
	import Header from '$components/header';
	import { enhance } from '$app/forms';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import Loader from '@lucide/svelte/icons/loader-circle';
	import * as Sidebar from '$ui/sidebar';
	import Icon from '$components/icon';
	import {
		setDocNavigationContext,
		type DocNavigationParams,
		type GroupedPages,
		type NavigationPage
	} from '$lib/doc-navigation-context.svelte';
	import type { Snippet } from 'svelte';
	import { cn } from '$utils';
	import Link from '$components/ui/link/link.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import siteConfig from '$lib/site.config';
	import GridPattern from '$lib/components/grid/grid-pattern.svelte';
	import * as TOC from '$ui/table-of-contents';
	import * as Collapsible from '$ui/collapsible';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	let {
		data,
		children
	}: {
		data: {
			navigation?: DocNavigationParams;
			emulated?: boolean;
		};
		children?: Snippet;
	} = $props();

	let isLoading = $state(false);

	function getContentContainer() {
		if (typeof document === 'undefined') return null;
		return document.getElementById('$content') as HTMLElement | null;
	}

	const docNavigation = setDocNavigationContext(
		() => data.navigation ?? { tabs: [], groups: [], pages: [] }
	);

	let toc: TOC.Context | null = $state.raw(null);
</script>

<Header />

<TOC.Provider container={getContentContainer()} onInit={(ctx) => (toc = ctx)}>
	<div
		class="relative container flex grow"
		data-docs-tabs={docNavigation.tabs.length > 0}
		data-docs-toc={toc && toc.tocEntries.length > 0}
	>
		<Sidebar.Root
			class={cn(
				'-ml-64.25 overflow-y-hidden opacity-0 transition-[margin,opacity] duration-300 lg:ml-0 lg:overflow-y-auto lg:opacity-100',
				'bg-background border-r',
				'top-docs-header h-[calc(100dvh-var(--spacing-docs-header))]'
			)}
		>
			<Sidebar.Container>
				<div
					class="from-background pointer-events-none sticky top-0 z-10 h-4 shrink-0 bg-linear-to-b"
				></div>
				<Sidebar.Content>
					{#if docNavigation.mode === 'group'}
						{@const data = docNavigation.data as GroupedPages[]}
						{#each data as navGroup (navGroup.id)}
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
												<Sidebar.MenuButton
													href={pageItem.href}
													isActive={pageItem.href === docNavigation.currentPage?.href}
												>
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
											<Sidebar.MenuButton
												href={pageItem.href}
												isActive={pageItem.href === docNavigation.currentPage?.href}
											>
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
					{:else if docNavigation.mode === 'page'}
						<Sidebar.Menu>
							{@const data = docNavigation.data as NavigationPage[]}
							{#each data as navPage (navPage.href)}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton
										href={navPage.href}
										isActive={navPage.href === docNavigation.currentPage?.href}
									>
										{#if navPage.icon}
											<Icon name={navPage.icon} class="size-4 shrink-0" />
										{/if}
										{navPage.title}
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{/each}
						</Sidebar.Menu>
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
								class={cn(
									'size-4 shrink-0',
									data.emulated ? 'text-accent' : 'text-muted-foreground'
								)}
							/>
							<span class="text-sm font-medium">Emulate Admin</span>
							{#if isLoading}
								<Loader class="ml-auto size-4 shrink-0 animate-spin" />
							{/if}
						</button>
					</form>
				</div>
			</Sidebar.Container>
		</Sidebar.Root>

		<div class="flex grow flex-col wrap-break-word">
			<div class="top-docs-header pointer-events-none sticky z-1">
				{#if toc && toc.tocEntries.length > 0}
					<Collapsible.Root
						class="bg-background h-docs-content-header pointer-events-auto border-b xl:hidden"
					>
						<Collapsible.Trigger
							class="text-muted-foreground group hover:text-foreground flex w-full items-center gap-2 px-4 py-2 text-sm transition-[color]"
						>
							<TOC.RadialProgress class="mr-2" />
							{#if docNavigation.currentGroup}
								<span class="block lg:hidden">{docNavigation.currentGroup?.title}</span>
								<ChevronRightIcon class="block size-4 shrink-0 lg:hidden" />
							{/if}
							<span class="block lg:hidden">{docNavigation.currentPage?.title}</span>
							<ChevronRightIcon class="block size-4 shrink-0 lg:hidden" />
							<span>{toc.activeItem?.text}</span>
							<ChevronRightIcon
								class=" ml-auto size-4 shrink-0 transition-[rotate] group-data-[state=open]:rotate-90"
							/>
						</Collapsible.Trigger>
						<Collapsible.Content
							class="bg-background max-h-[min(16rem,calc(100dvh-var(--spacing-docs-header)-var(--spacing-docs-content-header-toc)))] overflow-y-auto border-b px-4"
						>
							<TOC.Nav>
								<TOC.Label />
								<TOC.List />
							</TOC.Nav>
						</Collapsible.Content>
					</Collapsible.Root>
				{:else}
					<div
						class="bg-background h-docs-content-header text-muted-foreground pointer-events-auto flex items-center gap-2 border-b px-4 py-2 text-sm lg:hidden"
					>
						{#if docNavigation.currentGroup}
							<span>{docNavigation.currentGroup?.title}</span>
							<ChevronRightIcon class="size-4 shrink-0" />
						{/if}
						<span>{docNavigation.currentPage?.title}</span>
					</div>
				{/if}
				<div class="from-background h-6 bg-linear-to-b"></div>
			</div>
			<main
				class="relative flex min-w-0 grow flex-col gap-8 overflow-hidden px-6 transition-[padding] lg:px-14 lg:py-8"
			>
				{#if isLoading}
					<div class="flex grow items-center justify-center">
						<Loader class="text-muted-foreground size-8 shrink-0 animate-spin" />
					</div>
				{:else}
					<GridPattern
						class="absolute top-0 left-1/2 -z-1 h-64 w-7xl -translate-x-1/2 mask-[radial-gradient(ellipse_at_center,black,transparent)] opacity-50"
						width={40}
						height={40}
						strokeDashArray="4 2"
					/>
					<article class="grow">
						{@render children?.()}
					</article>
					<footer class="flex flex-col gap-4 text-sm">
						<div class="grid gap-4 sm:grid-cols-2">
							{#if docNavigation.prevPage}
								{@const group = docNavigation.getGroup(docNavigation.prevPage.groupId)}
								<Link
									href={docNavigation.prevPage.href}
									class="bg-secondary hover:bg-primary group text-muted-foreground hover:text-accent flex items-center justify-center gap-2 rounded-lg border p-4 text-sm font-medium transition-[background-color]"
								>
									<ArrowLeft class="size-4 shrink-0 transition-[color,margin] group-hover:mr-1" />
									<span class="transition-[color]">{docNavigation.prevPage.title}</span>
									{#if group}
										<div class="bg-border hidden h-4 w-px lg:block"></div>
										<span class="text-muted-foreground hidden lg:block">{group.title}</span>
									{/if}
								</Link>
							{/if}
							{#if docNavigation.nextPage}
								{@const group = docNavigation.getGroup(docNavigation.nextPage.groupId)}
								<Link
									href={docNavigation.nextPage.href}
									class="bg-secondary hover:bg-primary group text-muted-foreground hover:text-accent flex items-center justify-center gap-2 rounded-lg border p-4 text-sm font-medium transition-[background-color] sm:col-2"
								>
									{#if group}
										<span class="text-muted-foreground hidden lg:block">{group.title}</span>
										<div class="bg-border hidden h-4 w-px lg:block"></div>
									{/if}
									<span class="transition-[color]">{docNavigation.nextPage.title}</span>
									<ArrowRight class="size-4 shrink-0 transition-[color,margin] group-hover:ml-1" />
								</Link>
							{/if}
						</div>
						<hr />
						<div class="text-muted-foreground flex flex-wrap items-center justify-between gap-2">
							<p>Copyright © {new Date().getFullYear()} {siteConfig.name}</p>
							<p>Support Example</p>
						</div>
					</footer>
				{/if}
			</main>
			<div class="from-background pointer-events-none sticky bottom-0 z-1 h-6 bg-linear-to-t"></div>
		</div>

		<Sidebar.Root
			class={cn(
				'-mr-64 overflow-y-hidden opacity-0 transition-[margin,opacity] duration-300 xl:mr-0 xl:overflow-y-auto xl:opacity-100',
				'top-docs-header h-[calc(100dvh-var(--spacing-docs-header))]'
			)}
		>
			<Sidebar.Container>
				<TOC.Nav>
					<TOC.Label />
					<TOC.List />
				</TOC.Nav>
			</Sidebar.Container>
		</Sidebar.Root>
	</div>
</TOC.Provider>
