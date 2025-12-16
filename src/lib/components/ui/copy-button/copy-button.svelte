<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import Check from '@lucide/svelte/icons/check';
	import type { ClassValue } from 'svelte/elements';
	import * as Tooltip from '$ui/tooltip';
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import { cn } from '$utils';

	type Props = {
		class?: ClassValue;
		content: string;
		timeout?: number;
	} & TooltipPrimitive.TriggerProps;

	let { class: className, content, timeout = 3000, ...restProps }: Props = $props();

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

<Tooltip.Root>
	<Tooltip.Trigger
		onclick={copyToClipboard}
		class={cn(
			'bg-background text-muted-foreground hover:bg-primary hover:text-foreground rounded-md border p-1 shadow transition-colors',
			className
		)}
		{...restProps}
	>
		{#if copied}
			<Check class="size-4" />
		{:else}
			<Copy class="size-4" />
		{/if}
	</Tooltip.Trigger>
	<Tooltip.Content>
		{#if copied}
			Copied!
		{:else}
			Copy to clipboard
		{/if}
	</Tooltip.Content>
</Tooltip.Root>
