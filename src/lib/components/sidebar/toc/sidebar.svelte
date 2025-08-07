<script lang="ts">
	import { navigating } from '$app/state';
	import Sidebar from '../sidebar.svelte';
	import TableOfContents from '@lucide/svelte/icons/table-of-contents';
	import { cn } from '$lib';
	import { afterNavigate, onNavigate } from '$app/navigation';

	interface CONTENT {
		level: number;
		text: string;
		id: string;
		inView: boolean;
	}

	// table of contents that is displayed in its sidebar
	let contents: CONTENT[] = $state([]);

	// gets the first visible content in the table of contents by id
	let firstVisibleIndex = $derived(contents.findIndex((c) => c.inView));

	// observer for finding which heading is in view
	let observer: IntersectionObserver | null = null;

	function updateHeadings() {
		const content = document.getElementById('content');
		if (!content) return;

		const headings = [
			...content.querySelectorAll('h1, h2, h3, h4, h5, h6')
		] as HTMLHeadingElement[];

		if (headings.length < 1) return;

		const offset = document.getElementById('middle')?.offsetTop;
		observer = new IntersectionObserver(intersectionCallback, {
			rootMargin: `-${offset ? offset + 1 : 0}px 0px 0px 0px`
		});

		const tempContents: CONTENT[] = [];

		headings.forEach((heading) => {
			if (heading.classList.contains('toc-ignore')) return;

			const text = heading.textContent;
			if (!text) return; // skip if heading if it has no text

			// get the heading level
			const level = parseInt(heading.tagName[1]);

			// add the heading element to the observing to change its inView key
			if (observer) observer.observe(heading);

			// push heading details to contents array
			tempContents.push({ level, text, id: heading.id, inView: false });
		});

		contents = normalizeHeadingLevels(tempContents);
	}

	function normalizeHeadingLevels(headings: CONTENT[]): CONTENT[] {
		const result: CONTENT[] = [];
		const stack: number[] = [];

		for (const heading of headings) {
			// Remove deeper or same-level parents
			while (stack.length > 0 && heading.level <= stack[stack.length - 1]) stack.pop();
			stack.push(heading.level);

			// The visual level is the current stack depth
			result.push({
				...heading,
				level: stack.length
			});
		}

		return result;
	}

	function intersectionCallback(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			// find content index
			const idx = contents.findIndex((c) => c.id === entry.target.id);
			// set inView value
			if (idx > -1) contents[idx].inView = entry.isIntersecting;
		});
	}

	afterNavigate(updateHeadings);

	onNavigate(() => {
		if (observer) observer.disconnect();
		observer = null;
		contents = [];
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
				{#each contents as c, index}
					<a
						href="#{c.id}"
						class={cn(
							'block border-l py-1 pr-4 transition-colors',
							c.inView && 'border-primary/50',
							index === firstVisibleIndex
								? 'border-primary text-primary underline'
								: 'hover:text-primary'
						)}
						style="padding-left: {c.level}rem">{c.text}</a
					>
				{/each}
			</div>
		{/if}
	</div>
	<div class="from-background sticky bottom-0 bg-linear-to-t p-4"></div>
</Sidebar>
