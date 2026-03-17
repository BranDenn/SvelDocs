<script lang="ts">
	import { page } from '$app/state';
	import siteConfig from '$lib/configuration/site.config';
</script>

<svelte:head>
	<title>Error {page.status} - {siteConfig.name}</title>
</svelte:head>

<div class="grid grow content-center text-center">
	<h2 class="text-lg">Error {page.status}</h2>
	{page.error?.message}
</div>
