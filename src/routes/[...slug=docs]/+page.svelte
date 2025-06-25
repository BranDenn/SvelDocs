<script lang="ts">
	import './docs.css';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.title} - SvelDocs</title>
	{#if data.md?.description}
		<meta name="description" content={data.md?.description} />
	{/if}
</svelte:head>

<header class="flex flex-col gap-2">
	<h1 class="text-accent text-sm font-bold">{data.group}</h1>
	<h2 class="text-3xl font-extrabold">{data.md?.title ?? data.title}</h2>
	{#if data.md?.description}
		<p class="text-secondary text-lg">{data.md?.description}</p>
	{/if}
</header>

<hr class="border-border my-4" />

<article id="content" class="prose scrollbar">
	<data.component />
</article>
