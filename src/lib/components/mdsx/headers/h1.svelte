<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<h1 class="mt-12 text-4xl">
	{@render children()}
</h1>
