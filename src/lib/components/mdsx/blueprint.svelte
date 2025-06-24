<script lang="ts" module>
	export { h1, h2, h3, h4, h5, h6, pre, code, a } from './index';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

{@render children?.()}
