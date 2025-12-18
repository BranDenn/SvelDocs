<script lang="ts">
	import type { NavItem } from '$lib/docs';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Snippet } from 'svelte';
	import { Link } from '$ui/link';

	let { href, icon: Icon, title, children }: NavItem & { children?: Snippet } = $props();
</script>

<Link
	{href}
	class="bg-secondary hover:bg-primary flex items-center gap-2 rounded-lg border p-2 text-sm shadow transition-colors"
>
	<div class="flex flex-col gap-1">
		<div class="flex items-center gap-2">
			{#if Icon}
				{#if typeof Icon === 'string'}
					<span class="size-4 shrink-0">{Icon}</span>
				{:else}
					<Icon class="size-4 shrink-0" />
				{/if}
			{/if}
			<h2 class="font-medium">{@html title}</h2>
		</div>
		{@render children?.()}
	</div>
	<ChevronRight class="ml-auto size-4 shrink-0" />
</Link>
