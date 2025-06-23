<script lang="ts">
	import './docs.css';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.title} - SvelDocs</title>
	{#if data.mdDescription}
		<meta name="description" content={data.mdDescription} />
	{/if}
</svelte:head>

<header class="flex flex-col gap-2">
	<h1 class="text-accent text-sm font-bold">{data.group}</h1>
	<h2 class="text-3xl font-extrabold">{data.mdTitle ?? data.title}</h2>
	{#if data.mdDescription}
		<p class="text-secondary text-lg">{data.mdDescription}</p>
	{/if}
</header>

<hr class="border-border my-4" />

<article id="content" class="prose scrollbar">
	<data.component />
</article>
