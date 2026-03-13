<script lang="ts">
	import * as Dialog from '$ui/dialog';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { SEARCH_KEYBOARD_SHORTCUT } from './context.svelte';
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
		'group bg-background hover:border-primary hover:bg-muted isolate hidden w-full items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium shadow-md transition-colors lg:flex',
		className
	)}
	{...restProps}
>
	<SearchIcon class="size-4 shrink-0" />
	<span class="text-muted-foreground group-hover:text-foreground mr-auto transition-[color]">
		Search...
	</span>
	<div class="flex items-center gap-0.5">
		<kbd>{navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl'}</kbd>
		<kbd>{SEARCH_KEYBOARD_SHORTCUT}</kbd>
	</div>
</Dialog.Trigger>
