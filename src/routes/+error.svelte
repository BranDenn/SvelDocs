<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Error {page.status} - SvelDocs</title>
</svelte:head>

<div class="grid grow content-center justify-items-center gap-8 p-4">
	<div class="text-center">
		<h1 class="text-2xl">Error {page.status}</h1>
		{page.error?.message}
	</div>
	<a
		class="hover:bg-foreground hover:text-primary text-secondary hover:border-accent rounded border px-2 py-1 font-medium transition-colors"
		href="/">Home</a
	>
</div>
