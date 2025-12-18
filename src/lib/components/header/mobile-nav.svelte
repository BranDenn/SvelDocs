<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import { page } from '$app/state';
	import { NavMap } from '$lib/docs';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Nav from '../sidebar/doc/nav.svelte';
	import * as Sheet from '$ui/sheet';
	import { onNavigate } from '$app/navigation';

	let { open = $bindable(false) } = $props();

	onNavigate(() => {
		open = false;
	});

	let { title, group } = $derived(
		NavMap.get(`/${page.params.slug}`) ?? { title: null, group: null }
	);
</script>

<Sheet.Root bind:open>
	<div class="flex items-center gap-2">
		<Sheet.Trigger class="text-muted-foreground hover:text-foreground p-1 transition-colors">
			<Menu class="size-5" />
		</Sheet.Trigger>

		{#if title && group}
			<Sheet.Trigger class="text-muted-foreground shrink-0 text-sm">{group}</Sheet.Trigger>
			<ChevronRight class="text-muted-foreground size-4 shrink-0" />
			<Sheet.Trigger class="shrink-0 text-sm">{title}</Sheet.Trigger>
		{/if}
	</div>

	<Sheet.Content>
		<Nav class="scrollbar-thin h-full overflow-auto py-4" />
	</Sheet.Content>
</Sheet.Root>
