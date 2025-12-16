<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Dialog from '$ui/dialog';
	import { SearchDialogContent, KEYBOARD_SHORTCUT } from './';
	import { onNavigate } from '$app/navigation';

	let { children }: { children: Snippet } = $props();

	let open = $state(false);
	onNavigate(() => {
		open = false;
	});

	const handleShortcutKeydown = (e: KeyboardEvent) => {
		if (e.key === KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	};
</script>

<svelte:window onkeydown={handleShortcutKeydown} />

<Dialog.Root bind:open>
	{@render children()}
	<SearchDialogContent />
</Dialog.Root>
