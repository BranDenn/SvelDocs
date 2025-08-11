<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import { page } from '$app/state';
	import { NavMap } from '$lib/docs';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import MobileSidebar from '../sidebar/doc/mobile-sidebar.svelte';

	let { title, group } = $derived(NavMap.get(`/${page.params.slug}`) ?? { title: null, group: null });

	let open = $state(false);
</script>

<div class="flex items-center gap-2">
	<button
		class="text-secondary hover:text-primary p-1 transition-colors"
		onclick={() => (open = true)}
	>
		<Menu class="size-5" />
	</button>

	{#if title && group}
		<span class="text-secondary text-sm">{group}</span>
		<ChevronRight class="text-secondary size-4" />
		<span class="text-sm">{title}</span>
	{/if}
</div>

<MobileSidebar bind:open />
