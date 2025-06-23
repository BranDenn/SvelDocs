<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<h6 class="mt-2 text-base">
	{@render children()}
</h6>
