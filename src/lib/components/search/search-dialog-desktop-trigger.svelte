<script lang="ts">
	import * as Dialog from '$ui/dialog';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { KEYBOARD_SHORTCUT } from './';
	import { cn } from '$utils';
	import { Dialog as DialogPrimitive } from 'bits-ui';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DialogPrimitive.TriggerProps = $props();
</script>

<Dialog.Trigger
	bind:ref
	class={cn(
		'bg-primary hover:border-accent/50 group hidden w-full items-center gap-2 rounded-lg border p-2 text-xs font-medium transition-[border-color] md:flex',
		'[&_kbd]:bg-background',
		className
	)}
	{...restProps}
>
	<SearchIcon class="size-4 shrink-0" />
	<span class="text-muted-foreground group-hover:text-foreground mr-auto transition-[color]"
		>Search Docs...</span
	>
	<div class="flex items-center gap-0.5">
		<kbd>{navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl'}</kbd>
		<kbd>{KEYBOARD_SHORTCUT}</kbd>
	</div>
</Dialog.Trigger>
