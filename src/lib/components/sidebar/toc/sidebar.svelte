<script lang="ts">
	import { navigating } from '$app/state';
	import { untrack } from 'svelte';
	import Sidebar from '../sidebar.svelte';
	import TableOfContents from '@lucide/svelte/icons/table-of-contents';

	interface CONTENT {
		level: number;
		text: string;
		id: string;
		inView: boolean;
	}

	// table of contents that is displayed in its sidebar
	let contents: CONTENT[] = $state([]);

	// the minimum level of the headings for extra padding in the sidebar
	let minLevel: number = $derived(Math.min(...contents.map((c) => c.level)));

	// gets the first visible content in the table of contents by id
	let idxInView: number = $derived.by(() => {
		const idxFound = contents.findIndex((content) => content.inView);
		if (idxFound > -1) return idxFound;
		return contents.length - 1;
	});

	// observer for finding which heading is in view
	let observer: IntersectionObserver | null = null;

	function updateHeadings() {
		const content = document.getElementById('content');
		if (!content) return;

		const headings = [
			...content.querySelectorAll('h1, h2, h3, h4, h5, h6')
		] as HTMLHeadingElement[];

		if (headings.length < 1) return;

		const offset = document.getElementById('middle')?.offsetTop ?? 0;
		observer = new IntersectionObserver(intersectionCallback, {
			rootMargin: `-${offset}px 0px 0px 0px`
		});

		headings.forEach((heading) => {
			const text = heading.textContent;
			if (!text) return; // skip if heading if it has no text

			// get the heading level
			const level = parseInt(heading.tagName[1]);

			// add the heading element to the observing to change its inView key
			if (observer) observer.observe(heading);

			// push heading details to contents array
			contents.push({ level, text, id: heading.id, inView: false });
		});
	}

	function intersectionCallback(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			// find content index
			const idx = contents.findIndex((c) => c.id === entry.target.id);
			// set inView value
			if (idx > -1) contents[idx].inView = entry.isIntersecting;
		});
	}

	$effect(() => {
		// navigating.complete recalls this effect before and after navigation
		navigating.complete;

		// call function without triggering this $effect function
		untrack(updateHeadings);

		// cleanup
		return () => {
			if (observer) observer.disconnect();
			observer = null;
			contents = [];
		};
	});

	navigating;
</script>

<Sidebar class="scrollbar min-w-sidebar-toc hidden flex-col overflow-y-auto xl:flex">
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
				{#each contents as { text, id, level }, idx}
					{@const pl = level - minLevel + 1 + 'rem'}
					<a
						href="#{id}"
						class={[
							'block border-l py-1 pr-4 transition-colors',
							idx === idxInView ? 'border-primary text-primary' : 'hover:text-primary'
						]}
						style="padding-left: {pl}">{text}</a
					>
				{/each}
			</div>
		{/if}
	</div>
	<div class="from-background sticky bottom-0 bg-linear-to-t p-4"></div>
</Sidebar>
