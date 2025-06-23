<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<h4 class="mt-6 text-xl">
	{@render children()}
</h4>
