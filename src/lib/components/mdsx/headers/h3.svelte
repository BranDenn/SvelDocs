<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<h3 class="mt-8 text-2xl">
	{@render children()}
</h3>
