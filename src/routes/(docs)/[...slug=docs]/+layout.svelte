<script lang="ts">
	import './docs.css';
	import { Header, Body } from '$components/docs';
	import {
		setDocNavigationContext,
		type DocNavigationParams
	} from '$lib/doc-navigation-context.svelte';
	import type { Snippet } from 'svelte';
	import * as TOC from '$ui/table-of-contents';

	let {
		data,
		children
	}: {
		data: {
			navigation?: DocNavigationParams;
			emulated?: boolean;
		};
		children?: Snippet;
	} = $props();

	function getContentContainer() {
		if (typeof document === 'undefined') return null;
		return document.getElementById('$content') as HTMLElement | null;
	}

	setDocNavigationContext(() => data.navigation ?? { tabs: [], groups: [], pages: [] });
</script>

<Header />

<TOC.Provider container={getContentContainer()}>
	<Body>
		{@render children?.()}
	</Body>
</TOC.Provider>
