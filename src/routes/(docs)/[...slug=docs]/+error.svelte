<script lang="ts">
	import { page } from '$app/state';
	import siteConfig from '$lib/site.config';
</script>

<svelte:head>
	<title>Error {page.status} - {siteConfig.siteName}</title>
</svelte:head>

<div class="grid h-full content-center text-center">
	<h2 class="text-lg">Error {page.status}</h2>
	{page.error?.message}
</div>
