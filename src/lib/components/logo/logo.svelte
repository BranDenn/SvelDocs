<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$utils';

	let { class: className, ...restProps }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	height="16"
	viewBox="0 0 80 32"
	class={cn('fill-accent shrink-0', className)}
	{...restProps}
>
	<path d="M20 0H32L12 32H0L20 0Z" />
	<path d="M36 0H52L32 32H16L36 0Z" />
	<path d="M64 0H80L62 32H36L56 0Z" />
</svg>
