<script lang="ts">
	import Logo from './logo.svelte';
	import ThemeSwitch from './theme-switch.svelte';
	import Github from './github.svelte';
	import * as SearchDialog from '$components/search';
	import { SETTINGS } from '$lib/docs/docs.config';
</script>

<nav
	class={[
		'h-header bg-background isolate container flex items-center justify-between gap-4 px-4',
		SETTINGS.SEARCH_BAR_LOCATION === 'header' && 'md:grid md:grid-cols-3'
	]}
>
	<Logo />

	{#if SETTINGS.SEARCH_BAR_LOCATION === 'header'}
		<SearchDialog.DesktopTrigger class="w-64 justify-self-center" />
	{/if}

	<div class="flex items-center gap-2 justify-self-end">
		<SearchDialog.MobileTrigger />
		<ThemeSwitch />
		<Github />
	</div>
</nav>
