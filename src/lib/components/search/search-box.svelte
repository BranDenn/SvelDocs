<script lang="ts">
    import Search from "@lucide/svelte/icons/search";
    import { browser } from '$app/environment';
	import type { ClassValue } from "svelte/elements";
    import { cn } from "$lib";

    let {class: className, mode = "desktop"}: {class?: ClassValue, mode?: "desktop" | "mobile" }= $props();
</script>

<button class={cn(
    mode === "desktop" && "hidden md:flex text-xs font-medium rounded-lg border bg-foreground p-2 w-full text-sm items-center gap-2 hover:border-accent/50",
    mode === "mobile" && "p-1 md:hidden",
    "transition-colors text-secondary hover:text-primary",
    className)}
>
    <Search class={mode === "desktop" ? "size-4" : "size-5"} />
    {#if mode === "desktop"}
        Search Docs...
        {#if browser}
            <kbd class="ml-auto">
                {navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl'} K
            </kbd>
        {/if}
    {/if}
</button>

<!-- <button class="text-secondary hover:text-primary p-1 transition-colors">
		<Menu class="size-5" />
	</button> -->