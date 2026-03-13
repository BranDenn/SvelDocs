<script lang="ts">
	import { setSearch, type Search } from './context.svelte';
	import { SearchDialogContent } from './';
	import * as Dialog from '$ui/dialog';
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';

	let {
		open = $bindable(false),
		onInit = () => {},
		children,
		...restProps
	}: DialogPrimitive.RootProps & { onInit?: (ctx: Search) => void } = $props();

	const search = setSearch({
		getOpen: () => open,
		setOpen: (value: boolean) => (open = value) // sync state
	});

	onNavigate(() => {
		search.query = '';
		open = false;
	});

	onMount(() => {
		onInit(search);
	});
</script>

<svelte:window onkeydown={search.handleShortcutKeydown} />

<Dialog.Root bind:open {...restProps}>
	{@render children?.()}
	<SearchDialogContent />
</Dialog.Root>
