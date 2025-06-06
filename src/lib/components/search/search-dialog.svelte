<script lang="ts">
    import { Dialog } from "bits-ui";
    import Search from "@lucide/svelte/icons/search"
    import { fade, fly } from "svelte/transition";
    import { getContext, onMount } from "svelte";
    import type { OPEN } from ".";
    import { createSearchIndex, getSearchResults } from "./flexsearch";
    import { NAVIGATION } from "$settings";
    import {SearchLink} from ".";
	import { onNavigate } from "$app/navigation";

    const open : OPEN = getContext('search-dialog')

    let searchText : string = $state("")
    let results = $derived(getSearchResults(searchText))

    onMount(createSearchIndex)
    onNavigate(() => {open.current = false})

</script>

<svelte:window
	onkeydown={(e) => {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			open.current = !open.current
		}
	}}
/>

<Dialog.Root bind:open={open.current}>
    <Dialog.Portal>
        <Dialog.Overlay forceMount class="fixed inset-0 bg-background/75 backdrop-blur-xs z-50">
            {#snippet child({ props, open })}
                {#if open}
                    <div {...props} transition:fade={{duration: 150}}></div>
                {/if}
            {/snippet}
        </Dialog.Overlay>
        <Dialog.Content forceMount class="outline-none border fixed z-50 inset-0 top-4 sm:top-[10dvh] left-4 right-4 rounded-md shadow bg-background sm:max-w-xl mx-auto flex flex-col min-h-28 h-min max-h-[calc(100dvh-2rem)] sm:max-h-[80dvh]">
            {#snippet child({ props, open })}
                {#if open}
                    <div {...props} transition:fly={{duration: 150, y: -64}}>
                        <div class="flex w-full items-center gap-2 p-0 text-sm text-secondary p-4">
                            <Search class="size-5 shrink-0" />
                            <input
                                bind:value={searchText}
                                placeholder="Search Documentation..."
                                autocomplete="off"
                                spellcheck="false"
                                type="search"
                                class="h-full w-full text-primary outline-none"
                            />
                            <Dialog.Close class="rounded border p-1 text-xs font-semibold transition-colors hover:border-primary hover:text-primary">
                                ESC
                            </Dialog.Close>
                        </div>
                        <div class="w-full border-t p-4 flex flex-col gap-8 overflow-y-auto scrollbar">
                            {#if searchText === ""}
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