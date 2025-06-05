<script lang="ts">
    import { Dialog } from "bits-ui";
    import Search from "@lucide/svelte/icons/search"
    import { fade, fly } from "svelte/transition";

    let open = $state(true)
</script>

<Dialog.Root bind:open>
    <Dialog.Portal>
        <Dialog.Overlay forceMount class="fixed inset-0 bg-background/75 z-50">
            {#snippet child({ props, open })}
                {#if open}
                    <div {...props} transition:fade={{duration: 150}}></div>
                {/if}
            {/snippet}
        </Dialog.Overlay>
        <Dialog.Content forceMount class="border rounded-md shadow bg-background outline-hidden fixed top-4 sm:top-[clamp(1rem,10%,4rem)] transition-[top] left-4 right-4 z-50 max-w-xl mx-auto flex flex-col min-h-28 max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-25%)] [@media(min-height:420px)]:max-h-64">
            {#snippet child({ props, open })}
                {#if open}
                    <div {...props} transition:fly={{duration: 150, y: -64}}>
                        <div class="flex w-full items-center gap-2 p-0 text-sm text-secondary p-4">
                            <Search class="size-5 shrink-0" />
                            <input
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
                        <div class="w-full border-t p-4 flex flex-col gap-4 overflow-y-auto scrollbar">
                            {#each {length: 100}, i}
                                <span>{i}</span>
                            {/each}
                        </div>
                    </div>
                {/if}
            {/snippet}
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>