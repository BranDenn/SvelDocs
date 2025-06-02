<script lang="ts">
    import { page } from "$app/state";
    import { NavMap } from "$lib/docs";
    
    let { data } = $props();

    let { title, group } = $derived(NavMap.get(page.url.pathname) ?? { title: null, group: null });
    let visible_title = $derived(data.meta && data.meta.title ? data.meta.title : title);
    let description = $derived(data.meta && data.meta.description ? data.meta.description : "");
</script>

<svelte:head>
	<title>{title} - SvelDocs</title>
    <meta name="description" content={description} />
</svelte:head>

<header class="flex flex-col gap-2">
    <h1 class="text-sm font-bold text-accent">{group}</h1>
    <h2 class="text-3xl font-extrabold">{visible_title}</h2>
    {#if description}
        <p class="text-xl text-secondary">{description}</p>
    {/if}
</header>

<hr class="my-4 border-border" />

{@render data.component()}