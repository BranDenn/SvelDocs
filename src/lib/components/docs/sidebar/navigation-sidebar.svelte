<script lang="ts">
	import * as Sidebar from '$ui/sidebar';
	import { cn } from '$utils';
	import {
		getDocNavigationContext,
		type GroupedPages,
		type NavigationPage
	} from '$lib/doc-navigation-context.svelte';
	import Icon from '$components/icon';

	const docNavigation = getDocNavigationContext();
</script>

<Sidebar.Root
	class={cn(
		'-ml-64.25 overflow-y-hidden opacity-0 transition-[margin,opacity] duration-300 lg:ml-0 lg:overflow-y-auto lg:opacity-100',
		'bg-background border-r',
		'top-docs-header h-[calc(100dvh-var(--spacing-docs-header))]'
	)}
>
	<Sidebar.Container>
		<Sidebar.Header />
		<Sidebar.Content>
			{#if docNavigation.mode === 'group'}
				{@const data = docNavigation.data as GroupedPages[]}
				{#each data as navGroup, index (index)}
					{#if navGroup.showTitle}
						<Sidebar.Group collapsible={navGroup.collapsible}>
							<Sidebar.GroupLabel>
								{#if navGroup.icon}
									<Icon name={navGroup.icon} />
								{/if}
								{navGroup.title}
							</Sidebar.GroupLabel>
							{@render groupMenu(navGroup)}
						</Sidebar.Group>
					{:else}
						{@render groupMenu(navGroup)}
					{/if}
				{/each}
			{:else if docNavigation.mode === 'page'}
				<Sidebar.Menu>
					{@const data = docNavigation.data as NavigationPage[]}
					{#each data as navPage, index (index)}
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
		<Sidebar.Footer />
	</Sidebar.Container>
</Sidebar.Root>

{#snippet groupMenu(navGroup: GroupedPages)}
	<Sidebar.Menu>
		{#each navGroup.pages as pageItem, index (index)}
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
{/snippet}
