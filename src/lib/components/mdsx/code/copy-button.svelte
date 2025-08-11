<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import Check from '@lucide/svelte/icons/check';
	import type { ClassValue } from 'svelte/elements';
	import Tooltip from '$lib/components/ui/tooltip/tooltip.svelte';
	import { cn } from '$lib';

	let {
		class: className,
		style,
		content,
		timeout = 3000
	}: { class?: ClassValue; style: any; content: string; timeout?: number } = $props();

	let copied = $state(false);

	async function copyToClipboard() {
		if (copied) return;

		try {
			await navigator.clipboard.writeText(content);
			copied = true;
			setTimeout(() => (copied = false), timeout);
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	}
</script>

<Tooltip
	triggerProps={{
		class: cn(
			'bg-background hover:bg-foreground text-secondary hover:text-primary rounded border p-1 transition-colors',
			className
		),
		style: style,
		onclick: copyToClipboard
	}}
>
	{#snippet trigger()}
		{#if copied}
			<Check class="size-4" />
		{:else}
			<Copy class="size-4" />
		{/if}
	{/snippet}
	{#if copied}
		Copied!
	{:else}
		Copy to clipboard
	{/if}
</Tooltip>
