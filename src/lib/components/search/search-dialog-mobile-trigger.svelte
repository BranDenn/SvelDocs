<script lang="ts">
	import * as Dialog from '$ui/dialog';
	import * as Tooltip from '$ui/tooltip';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { cn } from '$utils';
	import { Tooltip as TooltipPrimitive } from 'bits-ui';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: TooltipPrimitive.TriggerProps = $props();
</script>

<Tooltip.Root>
	<Tooltip.Trigger
		bind:ref
		class={cn(
			'text-muted-foreground hover:text-foreground p-1 transition-colors md:hidden',
			className
		)}
		{...restProps}
	>
		{#snippet child({ props })}
			<Dialog.Trigger {...props}>
				<SearchIcon class="size-5 shrink-0" />
			</Dialog.Trigger>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content>Search Docs</Tooltip.Content>
</Tooltip.Root>
