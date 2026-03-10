<script lang="ts">
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
	const docNavigation = setDocNavigationContext(
		() => data.navigation ?? { tabs: [], groups: [], pages: [] }
	);
</script>

<Header />

<div class="relative container flex grow">
	<!-- <div
		class="from-accent/10 pointer-events-none absolute inset-0 top-0 z-20 h-[50dvh] bg-radial-[50%_50%_at_50%_0%]"
	></div> -->

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

	<div class="relative flex w-full min-w-0 flex-col wrap-break-word">
		<div
			class={cn(
				'from-background pointer-events-none sticky z-10 h-8 shrink-0 bg-linear-to-b transition-[top] duration-300',
				docNavigation.tabs.length > 0
					? 'top-[calc(var(--spacing-header)*2+1px)]'
					: 'top-[calc(var(--spacing-header)*2+1px)] lg:top-[calc(var(--spacing-header)+1px)]'
			)}
		></div>
		<div class="pointer-events-none absolute inset-0 z-20 overflow-hidden">
			<div class="from-accent/10 aspect-square bg-radial-[50%_50%_at_50%_0%]"></div>
		</div>
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
				<footer>
					<div class="grid gap-4 sm:grid-cols-2">
						{#if docNavigation.currentPage?.prev}
							<a
								href={docNavigation.currentPage.prev}
								class="text-muted-foreground hover:text-accent flex items-center justify-center gap-2 rounded-lg border p-4 text-sm font-medium"
							>
								← Previous
							</a>
						{/if}
						{#if docNavigation.currentPage?.next}
							<a
								href={docNavigation.currentPage.next}
								class="text-muted-foreground hover:text-accent flex items-center justify-center gap-2 rounded-lg border p-4 text-sm font-medium sm:col-2"
							>
								Next →
							</a>
						{/if}
					</div>
				</footer>
			{/if}
		</div>
		<div
			class="from-background pointer-events-none sticky bottom-0 z-10 h-8 shrink-0 bg-linear-to-t"
		></div>
	</div>
</div>
