<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { type Snippet } from 'svelte';
	import * as Dialog from '$ui/dialog';
	import { SearchDialogContent, KEYBOARD_SHORTCUT } from './';
	import { onNavigate } from '$app/navigation';
	import { setSearchContext, type Search } from './search-context.svelte';

	type Props = {
		onContextInit?: (ctx: Search) => void;
		children: Snippet;
	} & DialogPrimitive.Root;

	let { onContextInit = () => {}, children, ...restProps }: Props = $props();

	let open = $state(false);
	onNavigate(() => {
		searchContext.query = '';
		open = false;
	});

	const handleShortcutKeydown = (e: KeyboardEvent) => {
		if (e.key === KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	};

	const searchContext = setSearchContext();

	$effect(() => {
		onContextInit(searchContext);
	});
</script>

<svelte:window onkeydown={handleShortcutKeydown} />

<Dialog.Root bind:open {...restProps}>
	{@render children()}
	<SearchDialogContent />
</Dialog.Root>
