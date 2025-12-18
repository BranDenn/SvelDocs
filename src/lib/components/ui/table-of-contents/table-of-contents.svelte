<script lang="ts">
	import { cn } from '$utils';
	import type { ClassValue } from 'clsx';
	import type { HTMLAttributes } from 'svelte/elements';
	import TableOfContentsIcon from '@lucide/svelte/icons/table-of-contents';
	import { Link } from '$ui/link';
	import { page } from '$app/state';

	interface TOC {
		level: number;
		text: string;
		id: string;
		inView?: boolean;
		isIntersectingPriority?: boolean;
		parentIndex?: number;
	}

	type Props = {
		class?: ClassValue;
		container: HTMLElement | null;
		highlightParents?: boolean;
		topOffset?: number;
		observerOptions?: IntersectionObserverInit;
		detectIfReachedBottom?: boolean;
		reachedBottomObserverOptions?: IntersectionObserverInit;
	} & HTMLAttributes<HTMLDivElement>;

	let {
		class: className,
		container,
		highlightParents = true,
		topOffset = 0,
		observerOptions,
		detectIfReachedBottom = true,
		reachedBottomObserverOptions = { threshold: 1 }
	}: Props = $props();

	// table of contents that is displayed in its sidebar
	let toc: TOC[] = $state([]);

	let mostRecentEntry = $state(0);

	// gets the content prioritized in the table of contents by id
	let activeIndex = $derived.by(() => {
		const idx = toc.findLastIndex((c) => c.isIntersectingPriority);
		if (idx > 0) return idx;
		return mostRecentEntry;
	});

	// observer for finding which heading is in view
	let priorityViewObserver: IntersectionObserver | null = null;

	let lastScrollTop = 0;

	function priorityInstersectionCallback(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			// find content index
			const idx = toc.findIndex((c) => c.id === entry.target.id);

			const currentScrollTop = window.scrollY;
			const scrolledUp = currentScrollTop < lastScrollTop;
			lastScrollTop = currentScrollTop;

			if (idx <= 0) return;

			toc[idx].isIntersectingPriority = entry.isIntersecting;

			if (entry.isIntersecting) {
				mostRecentEntry = idx;
				return;
			}

			const prevIdx = idx - 1;
			if (prevIdx >= 0 && scrolledUp) {
				const previous = toc[prevIdx];
				if (!previous.isIntersectingPriority) mostRecentEntry = prevIdx;
			}
		});
	}

	let reachedBottomObserver: IntersectionObserver | null = null;

	function bottomIntersectionCallback(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			if (entry.isIntersecting) mostRecentEntry = toc.length - 1;
		});
	}

	function update() {
		if (!container) return;

		const headings = [
			...container.querySelectorAll('h1, h2, h3, h4, h5, h6')
		] as HTMLHeadingElement[];

		if (headings.length < 1) return;

		priorityViewObserver?.disconnect();
		priorityViewObserver = new IntersectionObserver(priorityInstersectionCallback, observerOptions);

		reachedBottomObserver?.disconnect();
		if (detectIfReachedBottom) {
			const lastElementChild = container.lastElementChild;
			if (lastElementChild) {
				reachedBottomObserver = new IntersectionObserver(
					bottomIntersectionCallback,
					reachedBottomObserverOptions
				);
				reachedBottomObserver.observe(lastElementChild);
			}
		}

		const tempTOC: TOC[] = [];

		const filteredHeadings = headings.filter(
			(heading) => heading.getAttribute('data-ignore-toc') !== 'true'
		);

		let intialIndex = 0;

		filteredHeadings.forEach((heading, i) => {
			// get the heading level
			const level = parseInt(heading.tagName[1]);

			// add the heading element to the observing to change its inView key
			priorityViewObserver?.observe(heading);

			// push heading details to contents array
			tempTOC.push({ level, text: heading.textContent.trim(), id: heading.id });

			// get the initial index when page is loaded
			const top = heading.getBoundingClientRect().top - topOffset;
			if (top <= 0) intialIndex = i;
		});

		mostRecentEntry = intialIndex;

		toc = normalizeHeadingLevels(tempTOC);
	}

	function normalizeHeadingLevels(headings: TOC[]): TOC[] {
		const result: TOC[] = [];
		const stack: TOC[] = [];

		for (const heading of headings) {
			// Remove deeper or same-level parents
			while (stack.length > 0 && heading.level <= stack[stack.length - 1].level) stack.pop();
			stack.push(heading);

			// The visual level is the current stack depth
			result.push({
				...heading,
				level: stack.length
			});

			if (highlightParents && stack.length > 1) {
				const parent = stack[stack.length - 2];
				const parentIndex = result.findLastIndex((c) => c.id === parent.id);
				if (parentIndex > -1) result[result.length - 1].parentIndex = parentIndex;
			}
		}

		return result;
	}

	function isParent(startingIndex: number, finalIndex: number) {
		if (!highlightParents || startingIndex < 0 || startingIndex >= toc.length) return false;

		const parentIndex = toc[startingIndex].parentIndex;
		if (parentIndex === undefined) return false;
		if (parentIndex === finalIndex) return true;
		return isParent(startingIndex - 1, finalIndex);
	}

	$effect(() => {
		page.url;
		update();

		return () => {
			priorityViewObserver?.disconnect();
			priorityViewObserver = null;
			reachedBottomObserver?.disconnect();
			reachedBottomObserver = null;
			toc = [];
		};
	});
</script>

{#if toc.length}
	<div class={cn('flex flex-col gap-4', className)}>
		<div class="bg-background flex items-center gap-2 text-sm">
			<TableOfContentsIcon class="size-4 shrink-0 stroke-3" />
			On this page
		</div>

		<div class="text-sm">
			{#each toc as c, i (c.id)}
				{@const isActive = i === activeIndex || isParent(activeIndex, i)}
				<Link
					href="#{c.id}"
					class={cn(
						'transition-font block border-l py-1 pr-4 transition-colors',
						c.inView && 'border-foreground/50',
						isActive
							? 'border-accent text-accent font-medium'
							: 'text-muted-foreground hover:text-foreground'
					)}
					style="padding-left: {c.level}rem"
				>
					{c.text}
				</Link>
			{/each}
		</div>
	</div>
{/if}
