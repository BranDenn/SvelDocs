<script lang="ts">
	import Link from './link.svelte';
	import { Collapsible } from 'bits-ui';
	import { NAVIGATION } from '$settings';
	import { SETTINGS } from '$settings';
	import { slide } from 'svelte/transition';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { ClassValue } from 'svelte/elements';
	import { cn } from '$lib';

	let { class: className }: { class?: ClassValue } = $props();
</script>

<nav class={cn('flex grow flex-col gap-8 px-8 text-sm', className)}>
	{#each NAVIGATION as nav}
		<div class="flex flex-col">
			{#if nav.show && SETTINGS.COLLAPSIBLE_NAV_GROUPS && nav.items.length}
				<Collapsible.Root open={true}>
					<Collapsible.Trigger class="group flex w-full items-center justify-between font-semibold">
						{nav.group}
						<ChevronRight class="size-4 transition-transform group-data-[state=open]:rotate-90" />
					</Collapsible.Trigger>
					<Collapsible.Content forceMount class="mt-2 flex flex-col">
						{#snippet child({ props, open })}
							{#if open}
								<div {...props} transition:slide={{ duration: 150 }}>
									{#each nav.items as { title, href, icon }}
										<Link {title} {href} {icon} />
									{/each}
								</div>
							{/if}
						{/snippet}
					</Collapsible.Content>
				</Collapsible.Root>
			{:else}
				{#if nav.show}
					<h1 class="mb-2 font-semibold">{nav.group}</h1>
				{/if}
				{#each nav.items as { title, href, icon }}
					<Link {title} {href} {icon} />
				{/each}
			{/if}
		</div>
	{/each}
</nav>
