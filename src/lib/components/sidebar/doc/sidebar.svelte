<script lang="ts">
	import Sidebar from '../sidebar.svelte';
	import { SETTINGS } from '$settings';
	import { SearchBox } from '$lib/components/search';
	import Nav from './nav.svelte';
</script>

<Sidebar
	class="scrollbar min-w-sidebar-nav hidden flex-col overflow-y-auto overscroll-contain border-r md:flex"
>
	{#if SETTINGS.SEARCH_BAR_LOCATION === 'sidebar'}
		<div class="sticky top-0 z-10">
			<div class="bg-background px-8 pt-8">
				<SearchBox />
			</div>
			<div class="from-background h-8 bg-linear-to-b"></div>
		</div>
	{:else}
		<div class="from-background sticky top-0 bg-linear-to-b p-4"></div>
	{/if}

	<Nav />

	<div class="from-background sticky bottom-0 bg-linear-to-t p-4"></div>
</Sidebar>
