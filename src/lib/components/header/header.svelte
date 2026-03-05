<script lang="ts">
	// import MobileNav from './mobile-nav.svelte';
	// import Nav from './nav.svelte';
	import Logo from './logo.svelte';
	import { page } from '$app/state';
	import { cn } from '$utils';
	import Icon from '$components/icon';

	type HeaderTab = {
		title: string;
		href: string;
		icon?: string;
	};

	let {
		tabs = [],
		activeTabHref = null
	}: { tabs?: HeaderTab[]; activeTabHref?: string | null } = $props();

	function isTabActive(tabHref: string) {
		if (activeTabHref) {
			return tabHref === activeTabHref;
		}

		return page.url.pathname === tabHref || page.url.pathname.startsWith(`${tabHref}/`);
	}
</script>

<header class="bg-background sticky top-0 z-30 border-b">
	<nav
		class="h-header bg-background isolate container flex items-center justify-between gap-4 px-4 md:grid md:grid-cols-3"
	>
		<Logo />
	</nav>

	<!-- Mobile & Tab navigation -->
	<div
		class={cn(
			'h-header container box-content gap-4 flex items-center border-t px-4 sm:box-border sm:border-none',
			tabs.length === 0 && 'lg:-mt-header transition-[margin] duration-300'
		)}
	>
		{#if tabs.length > 0}
			{#each tabs as tab (tab.title)}
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
