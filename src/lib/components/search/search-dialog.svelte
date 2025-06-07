<script lang="ts">
	import { Dialog } from 'bits-ui';
	import Search from '@lucide/svelte/icons/search';
	import { fade, fly } from 'svelte/transition';
	import { getContext, onMount } from 'svelte';
	import type { OPEN } from '.';
	import { createSearchIndex, getSearchResults } from './flexsearch';
	import { NAVIGATION } from '$settings';
	import { SearchLink } from '.';
	import { onNavigate } from '$app/navigation';

	const open: OPEN = getContext('search-dialog');

	let searchText: string = $state('');
	let results = $derived(getSearchResults(searchText));

	onMount(createSearchIndex);
	onNavigate(() => {
		open.current = false;
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			open.current = !open.current;
		}
	}}
/>

<Dialog.Root bind:open={open.current}>
	<Dialog.Portal>
		<Dialog.Overlay forceMount class="bg-background/75 fixed inset-0 z-50 backdrop-blur-xs">
			{#snippet child({ props, open })}
				{#if open}
					<div {...props} transition:fade={{ duration: 150 }}></div>
				{/if}
			{/snippet}
		</Dialog.Overlay>
		<Dialog.Content
			forceMount
			class="bg-background fixed inset-0 top-4 right-4 left-4 z-50 mx-auto flex h-min max-h-[calc(100dvh-2rem)] min-h-28 flex-col rounded-md border shadow transition-[height] outline-none sm:top-[10dvh] sm:max-h-[80dvh] sm:max-w-xl"
		>
			{#snippet child({ props, open })}
				{#if open}
					<div {...props} transition:fly={{ duration: 150, y: -64 }}>
						<div class="text-secondary flex w-full items-center gap-2 p-0 p-4 text-sm">
							<Search class="size-5 shrink-0" />
							<input
								bind:value={searchText}
								placeholder="Search Documentation..."
								autocomplete="off"
								spellcheck="false"
								type="search"
								class="text-primary h-full w-full outline-none"
							/>
							<Dialog.Close
								class="hover:border-primary hover:text-primary rounded border p-1 text-xs font-semibold transition-colors"
							>
								ESC
							</Dialog.Close>
						</div>
						<div
							class="scrollbar flex w-full flex-col gap-8 overflow-y-auto border-t p-4 transition-[height]"
						>
							{#if searchText === ''}
								{#each NAVIGATION as nav}
									<section class="flex flex-col gap-2">
										<h1 class="font-medium">{nav.group}</h1>
										{#each nav.items as { title, href, icon }}
											<SearchLink {href} {icon}>
												{title}
											</SearchLink>
										{/each}
									</section>
								{/each}
							{:else if results.size > 0}
								{#each results.entries() as [group, items]}
									<section class="flex flex-col gap-2">
										<h1 class="font-medium">{@html group}</h1>
										{#each items as { title, href, description, icon }}
											<SearchLink {href} {icon}>
												<div class="flex flex-col">
													<h1>{@html title}</h1>
													<p class="text-secondary">{@html description}</p>
												</div>
											</SearchLink>
										{/each}
									</section>
								{/each}
							{:else}
								<span class="text-center">No results found.</span>
							{/if}
						</div>
					</div>
				{/if}
			{/snippet}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
