<script lang="ts">
	import Sidebar from "../sidebar.svelte";
</script>

<Sidebar class="hidden xl:flex flex-col overflow-y-auto overscroll-contain scrollbar">
    <div class="sticky top-0 p-4 bg-linear-to-b from-background"></div>
    <div class="px-4 flex flex-col grow">
        {#each { length: 5 }, i}
            <a class="border-l hover:border-l-secondary px-4 py-1">Item: {i+1}</a>
        {/each}
    </div>
    <div class="sticky bottom-0 p-4 bg-linear-to-t from-background"></div>
</Sidebar>