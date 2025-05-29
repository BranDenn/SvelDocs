<script lang="ts">
    import Sidebar from "../sidebar.svelte";
    import Search from "@lucide/svelte/icons/search";
    import Link from "./link.svelte";
    import { browser } from '$app/environment';
    import { NAVIGATION } from "$settings";
</script>

<Sidebar class="hidden border-r md:flex flex-col overflow-y-auto overscroll-contain scrollbar">
    <div class="sticky top-0">
        <div class="bg-background pt-8 px-8">
            <button class="text-xs font-medium rounded-lg border bg-foreground p-2 w-full text-sm flex items-center gap-2 hover:border-accent/50 transition-colors text-secondary hover:text-primary">
                <Search class="size-4" />
                Search Docs...
                {#if browser}
                    <kbd class="ml-auto">
                        {navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl'} K
                    </kbd>
                {/if}
            </button>
        </div>
        <div class="h-8 bg-linear-to-b from-background"></div>
    </div>

    <nav class="px-8 flex flex-col grow text-sm gap-8">
        {#each NAVIGATION as nav}
            <div class="flex flex-col">
                {#if nav.show} 
                    <h1 class="font-semibold mb-2">{nav.group}</h1> 
                {/if}
                {#each nav.items as {title, href, icon}}
                    <Link {title} {href} {icon} />
                {/each}
            </div>
        {/each}
    </nav>

    <div class="sticky bottom-0 p-4 bg-linear-to-t from-background"></div>

</Sidebar>