<script lang="ts">
	import { cn } from '$utils';
	import type { ClassValue } from 'clsx';
	import { SvelteMap } from 'svelte/reactivity';
	import type { HTMLAttributes } from 'svelte/elements';
	import TableOfContentsIcon from '@lucide/svelte/icons/table-of-contents';
	import { Link } from '$ui/link';
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';

	interface TOC {
		level: number;
		text: string;
		id: string;
		heading: HTMLHeadingElement;
		parents: Set<string>;
		prevId?: string;
		isIntersectingPriority?: boolean;
	}

	type Props = {
		class?: ClassValue;
		container: HTMLElement | null | undefined;
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

	let toc = new SvelteMap<string, TOC>();
	let tocEntries = $derived(Array.from(toc.entries()));

	let reachedBottom = $state(false);
	let mostRecentKey = $state<string | null>(null);
	let lastKey = $state<string | null>(null);
	let warnedDuplicateIds = new Set<string>();
	let routeHashKey = $derived.by(() => {
		const hash = page.url.hash.replace('#', '');
		return hash && toc.has(hash) ? hash : null;
	});

	let activeKey = $derived.by(() => {
		if (routeHashKey) return routeHashKey;
		if (reachedBottom && lastKey) return lastKey;

		let intersectingKey: string | null = null;
		for (const [key, item] of tocEntries) {
			if (item.isIntersectingPriority) intersectingKey = key;
		}

		if (intersectingKey) return intersectingKey;
		if (mostRecentKey && toc.has(mostRecentKey)) return mostRecentKey;
		return null;
	});

	let activeItem = $derived(activeKey ? (toc.get(activeKey) ?? null) : null);

	let priorityViewObserver: IntersectionObserver | null = null;
	let reachedBottomObserver: IntersectionObserver | null = null;
	let lastScrollTop = 0;

	function priorityIntersectionCallback(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			const id = entry.target.id;
			const item = toc.get(id);
			if (!item) return;

			const currentScrollTop = window.scrollY;
			const scrolledUp = currentScrollTop < lastScrollTop;
			lastScrollTop = currentScrollTop;

			toc.set(id, { ...item, isIntersectingPriority: entry.isIntersecting });

			if (entry.isIntersecting) {
				mostRecentKey = id;
				return;
			}

			if (id === routeHashKey && !entry.isIntersecting) {
				goto('', { noScroll: true, replaceState: true });
				return;
			}

			const currentLastKey = lastKey;
			const currentLastItem = currentLastKey ? toc.get(currentLastKey) : null;
			if (currentLastKey && currentLastItem?.prevId === id && reachedBottom) {
				mostRecentKey = currentLastKey;
				return;
			}

			if (item.prevId && scrolledUp) {
				const previous = toc.get(item.prevId);
				if (previous && !previous.isIntersectingPriority) mostRecentKey = previous.id;
			}
		});
	}

	function bottomIntersectionCallback(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			if (toc.size === 0 || !lastKey) return;

			reachedBottom = entry.isIntersecting;

			if (entry.isIntersecting) {
				mostRecentKey = lastKey;
				return;
			}

			if (lastKey === routeHashKey && !entry.isIntersecting) {
				goto('', { noScroll: true, replaceState: true });
				return;
			}

			const currentLastItem = toc.get(lastKey);
			if (!currentLastItem || currentLastItem.isIntersectingPriority) return;
			if (mostRecentKey !== lastKey || !currentLastItem.prevId) return;

			let initialKey: string | null = null;
			for (const [key, { heading }] of toc) {
				const top = heading.getBoundingClientRect().top - topOffset;
				if (top <= 0) initialKey = key;
			}

			mostRecentKey = initialKey;
		});
	}

	function update() {
		if (!container) {
			toc.clear();
			reachedBottom = false;
			mostRecentKey = null;
			lastKey = null;
			return;
		}

		const headings = [
			...container.querySelectorAll('h1, h2, h3, h4, h5, h6')
		] as HTMLHeadingElement[];

		priorityViewObserver?.disconnect();
		priorityViewObserver = new IntersectionObserver(priorityIntersectionCallback, observerOptions);

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

		const filteredHeadings = headings.filter(
			(heading) => heading.getAttribute('data-ignore-toc') !== 'true' && heading.id
		);

		const stack: Array<{ id: string; level: number }> = [];
		const seenIds = new Set<string>();
		const nextEntries: Array<[string, TOC]> = [];
		let initialKey: string | null = null;
		let previousId: string | undefined;
		let finalKey: string | null = null;

		filteredHeadings.forEach((heading) => {
			const level = Number(heading.tagName.slice(1));
			while (stack.length > 0 && level <= stack[stack.length - 1].level) stack.pop();

			const id = heading.id;
			if (seenIds.has(id)) {
				if (!warnedDuplicateIds.has(id)) {
					console.warn(`Duplicate heading id "${id}" was ignored in table-of-contents.`);
					warnedDuplicateIds.add(id);
				}
				return;
			}

			const item: TOC = {
				id,
				text: heading.textContent?.trim() ?? '',
				level: stack.length + 1,
				heading,
				parents: new Set(stack.map(({ id: parentId }) => parentId)),
				prevId: previousId
			};

			nextEntries.push([id, item]);
			seenIds.add(id);
			stack.push({ id, level });
			priorityViewObserver?.observe(heading);

			const top = heading.getBoundingClientRect().top - topOffset;
			if (top <= 0) initialKey = id;

			previousId = id;
			finalKey = id;
		});

		toc.clear();
		for (const [key, item] of nextEntries) {
			toc.set(key, item);
		}

		reachedBottom = false;
		mostRecentKey = initialKey;
		lastKey = finalKey;
	}

	afterNavigate(({ type }) => {
		if (type === 'enter') {
			const element = document.getElementById(page.url.hash.replace('#', ''));
			element?.scrollIntoView();
			return;
		}

		if (type === 'link') {
			update();
		}
	});

	$effect(() => {
		update();

		return () => {
			priorityViewObserver?.disconnect();
			priorityViewObserver = null;
			reachedBottomObserver?.disconnect();
			reachedBottomObserver = null;
			toc.clear();
			reachedBottom = false;
			mostRecentKey = null;
			lastKey = null;
		};
	});
</script>

{#if toc.size}
	<!-- <nav
			aria-label="On this page"
			class={cn('flex flex-col', className)}
		>
			<div class="sticky top-0">
				<div class="flex items-center gap-2 bg-primary px-4 pt-4 text-sm">
					<TableOfContentsIcon class="size-4 shrink-0 stroke-3" />
					On this page
				</div>
			</div> -->

	<div class="text-sm">
		{#each tocEntries as [key, c] (key)}
			{@const isActive = key === activeKey}
			{@const isParent = highlightParents && (activeItem?.parents.has(key) ?? false)}
			<Link
				href="#{key}"
				aria-current={isActive ? 'location' : undefined}
				class={cn(
					'transition-font text-muted-foreground block border-l py-1 pr-4 transition-colors',
					!isActive && !isParent && 'hover:text-foreground',
					isParent && 'text-accent border-accent/75',
					isActive && 'text-accent border-accent font-medium'
				)}
				style="padding-left: {c.level}rem"
			>
				{c.text}
			</Link>
		{/each}
	</div>
	<!-- </nav> -->
{/if}
