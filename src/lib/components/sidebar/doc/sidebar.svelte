<script lang="ts">
	import Sidebar from '../sidebar.svelte';
	import { SETTINGS } from '$settings';
	import * as SearchDialog from '$components/search';
	import Nav from './nav.svelte';
</script>

<Sidebar
	class="scrollbar-thin min-w-sidebar-nav hidden flex-col overflow-y-auto overscroll-contain border-r md:flex"
>
	{#if SETTINGS.SEARCH_BAR_LOCATION === 'sidebar'}
		<div class="pointer-events-none sticky top-0 z-10">
			<div class="bg-background pointer-events-auto px-4 pt-8">
				<SearchDialog.DesktopTrigger />
			</div>
			<div class="from-background h-8 shrink-0 bg-linear-to-b"></div>
		</div>
	{:else}
		<div class="from-background pointer-events-none sticky top-0 h-8 shrink-0 bg-linear-to-b"></div>
	{/if}

	<Nav />

	<div
		class="from-background pointer-events-none sticky bottom-0 h-8 shrink-0 bg-linear-to-t"
	></div>
</Sidebar>
