<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Error {page.status} - SvelDocs</title>
</svelte:head>

<div class="grow grid content-center p-4 justify-items-center gap-8">
	<div class="text-center">
		<h1 class="text-2xl">Error {page.status}</h1>
		{page.error?.message}
	</div>
	<a class="border rounded py-1 font-medium px-2 hover:bg-foreground transition-colors hover:text-primary text-secondary hover:border-accent" href='/'>Home</a>
</div>