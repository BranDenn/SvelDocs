<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	type SeoProps = {
		title: string;
		description?: string;
		image?: string;
		type?: string;
		publishedTime?: string;
		modifiedTime?: string;
	};

	let {
		title,
		description,
		image,
		type = 'website',
		publishedTime,
		modifiedTime
	}: SeoProps = $props();

	let url = $state('');
	let fullTitle = $state('');
	let jsonLd = $state({});

	onMount(() => {
		const metaElement = document.querySelector('meta[property="og:site_name"]');
		const siteName = metaElement ? metaElement.getAttribute('content') : null;
		fullTitle = siteName ? title + ' - ' + siteName : title;
		url = page.url.origin + page.url.pathname; // url is update onMount to prevent getting the server side rendering value

		if (siteName) {
			jsonLd = {
				'@context': 'https://schema.org',
				'@type': type,
				name: siteName,
				url: url,
				description: description,
				image: image
			};
		}
	});
</script>

<svelte:head>
	<!-- title -->
	{#if fullTitle}
		<title>{fullTitle}</title>
		<meta property="og:title" content={fullTitle} />
		<meta name="twitter:title" content={fullTitle} />
	{/if}

	<!-- description -->
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
		<meta name="twitter:description" content={description} />
	{/if}

	<!-- URL -->
	<meta property="og:url" content={url} />
	<link rel="canonical" href={url} />

	<!-- Type -->
	<meta property="og:type" content={type} />

	<!-- Image -->
	{#if image}
		<meta property="og:image" content={image} />
		<meta name="twitter:image" content={image} />
	{/if}

	<!-- publish time -->
	{#if publishedTime}
		<meta property="article:published_time" content={publishedTime} />
	{/if}

	<!-- modify time -->
	{#if modifiedTime}
		<meta property="article:modified_time" content={modifiedTime} />
	{/if}

	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd, null, '\t')}</script>`}
</svelte:head>
