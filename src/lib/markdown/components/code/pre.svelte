<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Attachment } from 'svelte/attachments';
	import { CopyButton } from '$ui/copy-button';

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
		class="scrollbar-thin bg-secondary max-h-96 overflow-auto py-4 text-sm"
		{...restProps}
		{@attach codeAttach}>{@render children?.()}</pre>
	{#if language}
		<span
			class="text-muted-foreground bg-secondary/50 absolute top-2 rounded p-1 text-xs transition-opacity group-hover:opacity-0"
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
