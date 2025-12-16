<script lang="ts">
	import type { NavItem } from '$lib/docs';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Snippet } from 'svelte';
	import { Link } from '$ui/link';

	let { href, icon: Icon, title, children }: NavItem & { children?: Snippet } = $props();
</script>

<Link
	{href}
	class="bg-primary hover:text-accent hover:border-accent flex items-center gap-2 rounded-lg border p-2 text-sm shadow transition-colors"
>
	<div class="flex flex-col">
		<div class="flex items-center gap-2">
			{#if Icon}
				{#if typeof Icon === 'string'}
					<span class="size-4 shrink-0">{Icon}</span>
				{:else}
					<Icon class="size-4 shrink-0" />
				{/if}
			{/if}
			<h1>{@html title}</h1>
		</div>
		{@render children?.()}
	</div>
	<ChevronRight class="ml-auto size-4 shrink-0" />
</Link>
