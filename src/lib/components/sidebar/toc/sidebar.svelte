<script lang="ts">
	import Sidebar from '../sidebar.svelte';
	import { TableOfContents } from '$ui/table-of-contents';
	import { onMount } from 'svelte';

	let container: HTMLElement | null = $state(null);
	const topOffset = 81;
	const pOffset = { top: `${topOffset}px`, left: '0px', bottom: '50%', right: '0px' };

	onMount(() => {
		container = document.getElementById('content');
	});
</script>

<!-- Uncomment the below line to show how the root margin would look for the table of contents -->
<!-- <div class="fixed border border-red-500 z-100 pointer-events-none" style="top: {pOffset.top}; bottom: {pOffset.bottom}; left: {pOffset.left}; right: {pOffset.right}"></div> -->

<Sidebar
	class="min-w-sidebar-toc -mr-sidebar-toc flex flex-col py-8 pr-8 opacity-0 transition-[margin,opacity] duration-300 xl:mr-0 xl:opacity-100"
>
	<div class="scrollbar-thin flex flex-col overflow-y-auto">
		<div class="from-background sticky top-0 h-8 shrink-0 bg-linear-to-b"></div>
		<div class="flex grow flex-col gap-4 pr-4">
			<!-- <div
				class="grid aspect-4/3 content-center gap-4 rounded border-2 border-dashed p-4 text-center text-xs"
			>
				<span>Your logo here</span>
				<span class="text-muted-foreground">Support the project and reach developers.</span>
			</div> -->
			<TableOfContents
				{container}
				highlightParents={true}
				observerOptions={{
					rootMargin: `-${pOffset.top} -${pOffset.left} -${pOffset.bottom} -${pOffset.right}`
				}}
				reachedBottomObserverOptions={{
					threshold: 1.0,
					rootMargin: '0px 0px -32px 0px'
				}}
			/>
		</div>
		<div class="from-background sticky bottom-0 h-8 shrink-0 bg-linear-to-t"></div>
	</div>
</Sidebar>
