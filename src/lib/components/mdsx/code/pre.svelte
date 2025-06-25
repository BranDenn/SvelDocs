<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import CopyButton from './copy-button.svelte';

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

<style lang="postcss">
	@reference '../../../../app.css';

	:global([data-rehype-pretty-code-figure]) {
		@apply overflow-hidden rounded-md border shadow-xs;
	}
	:global([data-rehype-pretty-code-title]) {
		@apply bg-foreground border-b p-2 text-sm font-bold;
	}
	:global([data-rehype-pretty-code-caption]) {
		@apply text-secondary bg-foreground border-t p-2 text-sm;
	}
	:global([data-line]) {
		@apply inline-block pl-4;
	}
	:global([data-line]:hover) {
		@apply !bg-primary/5;
	}
	:global([data-line-numbers]) {
		counter-reset: line;
	}
	:global([data-line-numbers] > [data-line]::before) {
		counter-increment: line;
		content: counter(line);
		@apply text-secondary pr-4;
	}
	:global([data-highlighted-line]) {
		@apply !bg-accent/10;
	}
</style>
