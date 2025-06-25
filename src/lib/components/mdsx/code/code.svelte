<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<code>{@render children()}</code>

<style lang="postcss">
	@reference '../../../../app.css';

	:global(:not(pre) > code) {
		@apply bg-foreground text-primary rounded border px-1 py-0.5 text-sm text-nowrap shadow-xs;
	}
</style>
