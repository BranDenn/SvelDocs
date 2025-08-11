---
description: Component for alert notifcation blocks.
---


## Code

```svelte showLineNumbers
<script lang="ts">
	import Info from '@lucide/svelte/icons/info';
	import Lightbulb from '@lucide/svelte/icons/lightbulb';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import OctagonAlert from '@lucide/svelte/icons/octagon-alert';
	import type { Component, Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { cn } from '$lib';

	const Icons = {
		note: { icon: Info, class: 'text-blue-500' },
		tip: { icon: Lightbulb, class: 'text-green-500' },
		warning: { icon: TriangleAlert, class: 'text-yellow-500' },
		caution: { icon: OctagonAlert, class: 'text-red-500' }
	};

	interface Props {
		class?: ClassValue;
		children?: Snippet;
		title?: string;
		icon?: Component;
		type: keyof typeof Icons;
	}

	let { class: className, children, title, icon, type }: Props = $props();

	let Icon: Component = icon ?? Icons[type].icon;
	let Title: string = title ?? type.charAt(0).toUpperCase() + type.slice(1);
</script>

<div
	role="alert"
	class={cn(
		'grid gap-1 rounded border-l-4 border-current bg-current/5 fill-current p-4',
		Icons[type].class,
		className
	)}
>
	<div class="flex items-center gap-2 font-medium text-inherit">
		<Icon class="size-[1em] stroke-[2.5]"></Icon>
		{Title}
	</div>
	<p class="leading-normal">{@render children?.()}</p>
</div>
```