<script lang="ts">
	import './docs.css';
	import BlueprintRenderer from '$lib/markdown/BlueprintRenderer.svelte';

	type PageData = {
		ast: {
			children?: Array<Record<string, unknown>>;
		};
		metadata: {
			title?: string;
			description?: string;
		};
		slug: string;
	};

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.metadata.title ?? data.slug}</title>
	{#if data.metadata.description}
		<meta name="description" content={data.metadata.description} />
	{/if}
</svelte:head>

<article class="prose mx-auto w-full max-w-3xl p-6">
	{#each data.ast.children ?? [] as node, i (`node-${i}`)}
		<BlueprintRenderer node={node} />
	{/each}
</article>
