<script lang="ts">
	import Logo from './logo.svelte';
	import ThemeSwitch from './theme-switch.svelte';
	import Github from './github.svelte';
	import SearchBox from '$lib/components/search/search-box.svelte';
	import { SETTINGS } from '$settings';
</script>

<nav
	class={[
		'h-header container flex items-center justify-between gap-4 px-4',
		SETTINGS.SEARCH_BAR_LOCATION === 'header' && 'md:grid md:grid-cols-3'
	]}
>
	<Logo />

	{#if SETTINGS.SEARCH_BAR_LOCATION === 'header'}
		<SearchBox class="w-64 justify-end justify-self-center py-1" />
	{/if}

	<div class="flex items-center gap-2 justify-self-end">
		<SearchBox mode="mobile" />
		<ThemeSwitch />
		<Github />
	</div>
</nav>
