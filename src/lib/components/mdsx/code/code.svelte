<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<code>{@render children()}</code>

<style lang="postcss">
	@reference '../../../../app.css';

	:global(p > code) {
		@apply bg-foreground rounded border px-2 py-1 shadow-xs;
	}
</style>
