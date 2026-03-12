<script lang="ts">
	// import MobileNav from './mobile-nav.svelte';
	// import Nav from './nav.svelte';
	import Logo from './logo.svelte';
	import { cn } from '$utils';
	import Icon from '$components/icon';
	import { getDocNavigationContext } from '$lib/doc-navigation-context.svelte';
	import ThemeSwitch from './theme-switch.svelte';

	const docNavigation = getDocNavigationContext();

	function isTabActive(tabHref: string) {
		return docNavigation.currentTab?.href === tabHref;
	}
</script>

<header class="bg-background border-docs-header-main-border sticky top-0 z-30 border-b">
	<nav
		class="h-docs-header-main bg-background isolate container flex items-center justify-between gap-4 px-4 md:grid md:grid-cols-3"
	>
		<Logo />
		<div></div>
		<div class="flex items-center gap-4 justify-self-end">
			<ThemeSwitch />
		</div>
	</nav>

	<!-- Mobile & Tab navigation -->
	<div
		class={cn(
			'h-docs-header-secondary container box-content flex items-center gap-4 border-t px-4 sm:box-border sm:border-none',
			docNavigation.tabs.length === 0 && 'lg:-mt-docs-header-tabs transition-[margin] duration-300'
		)}
	>
		{#if docNavigation.tabs.length > 0}
			{#each docNavigation.tabs as tab (tab.id)}
				{@const active = isTabActive(tab.href)}
				<a
					href={tab.href}
					class={cn(
						'text-muted-foreground hidden h-full items-center gap-2 text-sm font-medium transition-colors sm:flex',
						active
							? 'text-accent border-accent h-[calc(100%+1px)] border-b'
							: 'hover:text-foreground'
					)}
				>
					{#if tab.icon}
						<Icon name={tab.icon} class="size-4 shrink-0" />
					{/if}
					{tab.title}
				</a>
			{/each}
		{/if}
		<!-- <MobileNav /> -->
	</div>
</header>
