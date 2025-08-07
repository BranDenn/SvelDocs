<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import CopyButton from './copy-button.svelte';
	import '../../../../app.css';

	let { children, ...restProps }: HTMLAttributes<HTMLPreElement> = $props();

	let codeContent = $state('');
</script>

<div class="group relative">
	<pre
		class="bg-foreground/50 overflow-auto py-4 text-sm"
		{...restProps}
		{@attach (node) => (codeContent = node.textContent ?? '')}>{@render children?.()}</pre>
	{#if codeContent}
		<CopyButton
			content={codeContent}
			class="absolute top-2 right-2 opacity-0 transition group-hover:opacity-100"
		/>
	{/if}
</div>
