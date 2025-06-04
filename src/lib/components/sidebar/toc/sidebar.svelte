<script lang="ts">
	import { navigating } from '$app/state';
	import { untrack } from 'svelte';
	import Sidebar from '../sidebar.svelte';
	import TableOfContents from '@lucide/svelte/icons/table-of-contents';

	interface CONTENT {
		level: number;
		text: string;
		id: string;
	}

	let contents: CONTENT[] = $state([]);
	let minLevel: number = $derived(Math.min(...contents.map((c) => c.level)));

	function updateHeadings() {
		const content = document.getElementById('content');
		if (!content) return;

		const headings = [
			...content.querySelectorAll('h1, h2, h3, h4, h5, h6')
		] as HTMLHeadingElement[];

		headings.forEach((heading) => {
			const text = heading.textContent;
			if (!text) return;
			const id = text
				.toLowerCase()
				.replace(/[^a-zA-Z0-9\s]/g, '')
				.replaceAll(' ', '-');
			const level = parseInt(heading.tagName[1]);
			heading.id = id;
			contents.push({ level, text, id });
		});
	}

	$effect(() => {
		navigating.complete;

		untrack(updateHeadings);

		return () => {
			contents = [];
		};
	});
</script>

<Sidebar
	class="scrollbar min-w-sidebar-toc hidden flex-col overflow-y-auto overscroll-contain xl:flex"
>
	<div class="from-background sticky top-0 bg-linear-to-b p-4"></div>
	<div class="flex grow flex-col gap-4 px-4 font-medium">
		<div
			class="grid aspect-4/3 content-center gap-4 rounded border-2 border-dashed p-4 text-center text-xs"
		>
			<span>Your logo here</span>
			<span class="text-secondary">Support the project and reach developers.</span>
		</div>
		{#if contents.length > 0}
			<div class="flex items-center gap-2 text-sm">
				<TableOfContents class="size-4 stroke-3" />
				On this page
			</div>
			<div class="text-secondary text-sm">
				{#each contents as { text, id, level }}
					{@const pl = level - minLevel + 0.5 + 'rem'}
					<a
						href="#{id}"
						class="hover:text-primary block border-l py-1 pr-4 transition-colors"
						style="padding-left: {pl}">{text}</a
					>
				{/each}
			</div>
		{/if}
	</div>
	<div class="from-background sticky bottom-0 bg-linear-to-t p-4"></div>
</Sidebar>
