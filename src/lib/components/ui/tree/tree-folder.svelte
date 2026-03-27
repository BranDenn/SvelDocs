<script lang="ts">
	import { cn } from '$utils';
    import { type WithElementRef } from 'bits-ui';
    import type { HTMLAttributes } from 'svelte/elements';
    import * as Collapsible from '$ui/collapsible';
    import type { Attachment } from 'svelte/attachments';
    import FolderClosedIcon from '@lucide/svelte/icons/folder-closed';
    import FolderOpenIcon from '@lucide/svelte/icons/folder-open';

    type Props = {
        open?: boolean;
        name: string;
    } & WithElementRef<HTMLAttributes<HTMLLIElement>>

	let {
		ref = $bindable(null),
        open = $bindable(false),
        name,
		class: className,
        children,
		...restProps
    }: Props = $props();

    const mergedProps = $derived({
        class: cn('flex w-full min-w-0 flex-col gap-px', className),
        'data-slot': 'tree-item',
        ...restProps
    });
</script>

<Collapsible.Root bind:open>
    <Collapsible.Trigger class="flex items-center gap-2">
        {#if open}
            <FolderOpenIcon />
        {:else}
            <FolderClosedIcon />
        {/if}
        {name}
    </Collapsible.Trigger>
    <Collapsible.Content class="space-y-px ml-2">
        {#snippet child({ props })}
            <ul {...props}>
                {@render children?.()}
            </ul>
        {/snippet}
    </Collapsible.Content>
</Collapsible.Root>