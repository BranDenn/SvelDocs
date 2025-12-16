<script lang="ts">
	import './docs.css';
	import SEO from '$components/seo';

	let { data } = $props();
</script>

<SEO title={data.title} description={data.md.description} type="article" />

<header class="flex flex-col gap-2">
	<h1 class="text-accent text-sm font-bold">{data.group}</h1>
	<h2 class="text-3xl font-extrabold">{data.md?.title ?? data.title}</h2>
	{#if data.md?.description}
		<p class="text-muted-foreground text-lg">{data.md?.description}</p>
	{/if}
</header>

<hr class="border-border my-4" />

<article id="content" class="prose scrollbar-thin">
	<data.component />
</article>
