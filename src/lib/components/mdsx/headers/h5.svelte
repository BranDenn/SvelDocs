<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<h5 class="mt-4 text-lg">
	{@render children()}
</h5>
