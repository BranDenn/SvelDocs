<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { fade, fly } from 'svelte/transition';
	import Nav from './nav.svelte';
	import X from '@lucide/svelte/icons/x';
	import { onNavigate } from '$app/navigation';

	let { open = $bindable(false) } = $props();

	onNavigate(() => {
		open = false;
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay forceMount class="bg-background/75 fixed inset-0 z-50 backdrop-blur-xs">
			{#snippet child({ props, open })}
				{#if open}
					<div {...props} transition:fade={{ duration: 150 }}></div>
				{/if}
			{/snippet}
		</Dialog.Overlay>
		<Dialog.Content
			forceMount
			class="bg-background min-w-sidebar-nav fixed top-0 bottom-0 left-0 z-50 border-r"
		>
			{#snippet child({ props, open })}
				{#if open}
					<div {...props} transition:fly={{ duration: 150, x: '-100%', opacity: 100 }}>
						<Dialog.Close
							class="text-secondary hover:text-primary absolute top-4 right-4 transition-colors"
						>
							<X class="size-6" />
						</Dialog.Close>
						<Nav class="scrollbar h-full overflow-auto py-8" />
					</div>
				{/if}
			{/snippet}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
