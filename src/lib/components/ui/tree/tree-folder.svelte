<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import * as Collapsible from '$ui/collapsible';
	import FolderClosedIcon from '@lucide/svelte/icons/folder-closed';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import { setTreeLevel, getTreeLevel, getTreeOpen } from './tree-context.svelte';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	type Props = {
		open?: boolean;
		name: string;
		noInteraction?: boolean;
	} & HTMLAttributes<HTMLLIElement>;

	let { open = $bindable(false), name, noInteraction = false, children }: Props = $props();

	const treeLevelCtx = getTreeLevel();
	setTreeLevel(treeLevelCtx.level + 1);

	const treeOpenCtx = getTreeOpen();

	if (treeOpenCtx.noInteraction) noInteraction = true;

	$effect(() => {
		if (treeOpenCtx.open !== null) {
			open = treeOpenCtx.open;
		}
	});

	$effect(() => {
		if (open !== treeOpenCtx.open && treeOpenCtx.open !== null) {
			treeOpenCtx.clear();
		}
	});
</script>

<Collapsible.Root
	bind:open={
		() => open,
		(v: boolean) => {
			if (!noInteraction) open = v;
		}
	}
	data-level={treeLevelCtx.level}
>
	<Collapsible.Trigger
		class={[
			'group text-muted-foreground hover:text-foreground hover:bg-primary flex w-full items-center gap-2 rounded py-1 pr-2 transition-colors',
			noInteraction ? 'cursor-default' : ''
		]}
		style="padding-left: {treeLevelCtx.level * 1.5 + 0.5}rem;"
	>
		<ChevronRightIcon class="transition-[rotate] group-data-[state=open]:rotate-90" />
		{#if open}
			<FolderOpenIcon />
		{:else}
			<FolderClosedIcon />
		{/if}
		{name}
	</Collapsible.Trigger>
	<Collapsible.Content class="relative">
		{#snippet child({ props })}
			<ul {...props}>
				{@render children?.()}
				<div
					class="bg-border absolute top-0 bottom-0 w-px"
					style="left: {treeLevelCtx.level * 1.5 + 1}rem;"
				></div>
			</ul>
		{/snippet}
	</Collapsible.Content>
</Collapsible.Root>
