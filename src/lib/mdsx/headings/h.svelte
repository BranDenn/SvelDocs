<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import LinkIcon from '@lucide/svelte/icons/link';

	type Props = {
		element: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	} & HTMLAttributes<HTMLHeadingElement>;

	let { element = 'h2', children, class: className, ...restProps }: Props = $props();
</script>

<svelte:element this={element} class={cn('group relative font-bold', className)} {...restProps}>
	<div class="absolute top-1/2 left-0 hidden -translate-x-full -translate-y-1/2 pr-4 md:block">
		<a
			class="bg-background hover:bg-primary text-muted-foreground hover:text-foreground block rounded-md border p-1 opacity-0 transition-[opacity,background-color,color] group-hover:opacity-100"
			href="#{restProps.id}"
		>
			<LinkIcon class="size-4" />
		</a>
	</div>
	{@render children?.()}
</svelte:element>
