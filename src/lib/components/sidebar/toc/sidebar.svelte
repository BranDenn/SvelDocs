<script lang="ts">
	import { navigating } from "$app/state";
	import { untrack } from "svelte";
    import Sidebar from "../sidebar.svelte";

    interface CONTENT {
        level: number;
        text: string;
        id: string;
    }

    let contents: CONTENT[] = $state([]);
    let minLevel : number = $derived(Math.min(...contents.map(c => c.level)))

    function updateHeadings() {
        const content = document.getElementById("content");
        if (!content) return;

        const headings = [...content.querySelectorAll("h1, h2, h3, h4, h5, h6")] as HTMLHeadingElement[];

        headings.forEach((heading) => {
            const text = heading.textContent;
            if (!text) return;
            const id = text.toLowerCase().replaceAll(' ', "-")
            const level = parseInt(heading.tagName[1]);
            heading.id = id
            contents.push({ level, text, id });
        });
    }

    $effect(() => {
        navigating.complete;

        untrack(updateHeadings)

		return () => {
            console.log("Cleaning headings...");
            contents = []
		};
    })
</script>

{#if contents.length > 0}
    <Sidebar class="hidden xl:flex flex-col overflow-y-auto overscroll-contain scrollbar min-w-sidebar-toc">
        <div class="sticky top-0 p-4 bg-linear-to-b from-background"></div>
        <div class="px-4 flex flex-col grow font-medium">
            <div class="rounded border-2 border-dashed p-4 mb-4 aspect-4/3 grid content-center text-center text-xs gap-4">
                <span>Your logo here</span>
                <span class="text-secondary">Support the project and reach developers.</span>
            </div>
            {#each contents as { text, id, level }}  
                {@const pl = (level - minLevel + 1) + "rem"}
                <a href="#{id}" class="border-l pr-4 py-1 text-secondary hover:text-primary transition-colors" style="padding-left: {pl}">{text}</a>
            {/each}
        </div>
        <div class="sticky bottom-0 p-4 bg-linear-to-t from-background"></div>
    </Sidebar>
{/if}