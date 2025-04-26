<script lang="ts">
	import { page } from "$app/state";
</script>

<svelte:head>
	<title>Error {page.status} - SvelDocs</title>
</svelte:head>

<h1>{page.status}: {page.error?.message}</h1>