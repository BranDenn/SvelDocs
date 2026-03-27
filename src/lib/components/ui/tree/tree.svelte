<script lang="ts">
	import { cn } from '$utils';
    import type { WithElementRef } from 'bits-ui';
    import type { HTMLAttributes } from 'svelte/elements';
    import { setTree } from './tree-context.svelte';

    type Props = WithElementRef<HTMLAttributes<HTMLUListElement>>

	let {
		ref = $bindable(null),
		class: className,
        children,
		...restProps
    }: Props = $props();

    setTree();
</script>

<ul 
    bind:this={ref}
    data-slot="tree"
    class={cn('[&_svg]:shrink-0 [&_svg]:size-4', className)}
    {...restProps}
>
    {@render children?.()}
</ul>