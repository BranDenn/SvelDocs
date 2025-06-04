<script lang="ts">
	import Logo from './logo.svelte';
	import ThemeSwitch from './theme-switch.svelte';
	import Github from './github.svelte';
	import SearchBox from '$lib/components/search/search-box.svelte';
	import { SETTINGS } from '$settings';
</script>

<nav class={[
	"h-header container justify-between flex items-center px-4 gap-4", 
	SETTINGS.SEARCH_BAR_LOCATION === "header" && "md:grid md:grid-cols-3"]}>
	<Logo />

	{#if SETTINGS.SEARCH_BAR_LOCATION === "header"}
		<SearchBox class="justify-end w-64 justify-self-center py-1"/>
	{/if}

	<div class="flex items-center gap-2 justify-self-end">
		<SearchBox mode="mobile"/>
		<ThemeSwitch />
		<Github />
	</div>
</nav>
