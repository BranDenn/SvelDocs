<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Attachment } from 'svelte/attachments';
	import CopyButton from './copy-button.svelte';
	import '../../../../app.css';

	let { children, ...restProps }: HTMLAttributes<HTMLPreElement> = $props();

	let codeContent = $state('');
	let language = $state('');
	let scrollbarWidth = $state(0);

	const codeAttach: Attachment = (node) => {
		if (!(node instanceof HTMLPreElement)) return;
		codeContent = node.textContent ?? '';
		language = node.getAttribute('data-language') ?? '';
		scrollbarWidth = node.offsetWidth - node.clientWidth;
	};
</script>

<div class="group relative">
	<pre
		class="scrollbar max-h-96 overflow-auto py-4 text-sm bg-block"
		{...restProps}
		{@attach codeAttach}>{@render children?.()}</pre>
	{#if language}
		<span
			class="text-secondary absolute top-2 text-xs transition-opacity group-hover:opacity-0 rounded bg-block/50 p-1"
			style="right: calc(0.5rem + {scrollbarWidth}px);"
		>
			.{language}
		</span>
	{/if}
	{#if codeContent}
		<CopyButton
			content={codeContent}
			class="absolute top-2 opacity-0 transition group-hover:opacity-100"
			style="right: calc(0.5rem + {scrollbarWidth}px);"
		/>
	{/if}
</div>
