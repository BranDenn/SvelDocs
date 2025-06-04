<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import { page } from '$app/state';
	import { NavMap } from '$lib/docs';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let { title, group } = $derived(NavMap.get(page.url.pathname) ?? { title: null, group: null });
</script>

<div class="flex items-center gap-2">
	<button class="text-secondary hover:text-primary p-1 transition-colors">
		<Menu class="size-5" />
	</button>

	{#if title && group}
		<span class="text-secondary text-sm">{group}</span>
		<ChevronRight class="size-4 text-secondary"/>
		<span class="text-sm">{title}</span>
	{/if}
</div>