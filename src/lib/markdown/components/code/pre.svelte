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
	{#if language || codeContent}
		<div
			class="bg-secondary/50 pointer-events-none absolute top-0 flex items-center gap-2 p-1 transition-[background-color] group-hover:bg-transparent"
			style="right: {scrollbarWidth}px;"
		>
			{#if language}
				<span class="text-xs transition-opacity group-hover:opacity-0">
					.{language}
				</span>
			{/if}
			{#if codeContent}
				<CopyButton content={codeContent} class="pointer-events-auto" />
			{/if}
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference "$css";

	:global {
		code[data-theme*=' '],
		code[data-theme*=' '] span {
			color: var(--shiki-light);
		}

		.dark code[data-theme*=' '],
		.dark code[data-theme*=' '] span {
			color: var(--shiki-dark);
		}

		[data-rehype-pretty-code-figure] {
			@apply overflow-hidden rounded-md border shadow-xs;
		}
		[data-rehype-pretty-code-title] {
			@apply bg-primary border-b p-2 text-sm font-bold;
		}
		[data-rehype-pretty-code-caption] {
			@apply text-muted-foreground bg-primary border-t p-2 text-sm;
		}
		[data-line] {
			@apply inline-block px-4 hover:bg-[color-mix(in_oklch,var(--color-background),#808080_25%)];
		}
		[data-line-numbers] {
			counter-reset: line;
		}
		[data-line-numbers] > [data-line] {
			@apply pl-0;
		}
		[data-line-numbers] > [data-line]::before {
			counter-increment: line;
			content: counter(line);
			@apply text-muted-foreground/75;
		}
		[data-line-numbers-max-digits] {
			--w: attr(data-line-numbers-max-digits ch);
			& > [data-line]:hover::before {
				@apply text-foreground bg-[color-mix(in_oklch,var(--color-background),#808080_35%)];
			}
			& > [data-line]::before {
				width: calc(var(--w) + 2rem);
				@apply bg-secondary sticky left-0 mr-4 inline-block border-r px-4 text-right;
			}
		}
		[data-highlighted-line] {
			@apply bg-accent/10!;
		}
	}
</style>
