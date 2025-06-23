<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<h2 class="mt-10 text-3xl">
	{@render children()}
</h2>
