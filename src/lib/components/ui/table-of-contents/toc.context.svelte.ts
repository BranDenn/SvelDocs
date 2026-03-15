import { createContext } from 'svelte';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { SvelteMap } from 'svelte/reactivity';

type TOCItem = {
	index: number;
	level: number;
	text: string;
	id: string;
	heading: HTMLHeadingElement;
	parents: Set<string>;
	prevId?: string;
	isIntersectingPriority?: boolean;
};

export type TOCContextProps = {
	getContainer: () => HTMLElement | null | undefined;
	getHighlightParents: () => boolean;
	getTopOffset: () => number;
	getObserverOptions: () => IntersectionObserverInit | undefined;
	getDetectIfReachedBottom: () => boolean;
	getReachedBottomObserverOptions: () => IntersectionObserverInit | undefined;
};

export class TOCContext {
	readonly #getContainer: TOCContextProps['getContainer'];
	readonly #getHighlightParents: TOCContextProps['getHighlightParents'];
	readonly #getTopOffset: TOCContextProps['getTopOffset'];
	readonly #getObserverOptions: TOCContextProps['getObserverOptions'];
	readonly #getDetectIfReachedBottom: TOCContextProps['getDetectIfReachedBottom'];
	readonly #getReachedBottomObserverOptions: TOCContextProps['getReachedBottomObserverOptions'];

	readonly #toc = new SvelteMap<string, TOCItem>();
	readonly #warnedDuplicateIds = new Set<string>();

	#reachedBottom = $state(false);
	#mostRecentKey = $state<string | null>(null);
	#lastKey = $state<string | null>(null);
	#lastScrollTop = 0;
	#priorityViewObserver: IntersectionObserver | null = null;
	#reachedBottomObserver: IntersectionObserver | null = null;

	public readonly tocEntries = $derived(Array.from(this.#toc.entries()));

	public readonly routeHashKey = $derived.by(() => {
		const hash = page.url.hash.replace('#', '');
		return hash && this.#toc.has(hash) ? hash : null;
	});

	public readonly activeKey = $derived.by(() => {
		if (this.routeHashKey) return this.routeHashKey;
		if (this.#reachedBottom && this.#lastKey) return this.#lastKey;

		let intersectingKey: string | null = null;
		for (const [key, item] of this.tocEntries) {
			if (item.isIntersectingPriority) intersectingKey = key;
		}

		if (intersectingKey) return intersectingKey;
		if (this.#mostRecentKey && this.#toc.has(this.#mostRecentKey)) return this.#mostRecentKey;
		return null;
	});

	public readonly activeItem = $derived.by(() => {
		if (!this.activeKey) return null;
		return this.#toc.get(this.activeKey) ?? null;
	});

	public readonly activeIndex = $derived.by(() => {
		if (!this.activeKey) return 0;
		return this.#toc.get(this.activeKey)?.index ?? 0;
	});

	public readonly hasEntries = $derived(this.#toc.size > 0);

	constructor(props: TOCContextProps) {
		this.#getContainer = props.getContainer;
		this.#getHighlightParents = props.getHighlightParents;
		this.#getTopOffset = props.getTopOffset;
		this.#getObserverOptions = props.getObserverOptions;
		this.#getDetectIfReachedBottom = props.getDetectIfReachedBottom;
		this.#getReachedBottomObserverOptions = props.getReachedBottomObserverOptions;
	}

	get highlightParents() {
		return this.#getHighlightParents();
	}

	readonly priorityIntersectionCallback = (entries: IntersectionObserverEntry[]) => {
		entries.forEach((entry) => {
			const id = entry.target.id;
			const item = this.#toc.get(id);
			if (!item) return;

			const currentScrollTop = window.scrollY;
			const scrolledUp = currentScrollTop < this.#lastScrollTop;
			this.#lastScrollTop = currentScrollTop;

			this.#toc.set(id, { ...item, isIntersectingPriority: entry.isIntersecting });

			if (entry.isIntersecting) {
				this.#mostRecentKey = id;
				return;
			}

			if (id === this.routeHashKey && !entry.isIntersecting) {
				goto('', { noScroll: true, replaceState: true });
				return;
			}

			const currentLastKey = this.#lastKey;
			const currentLastItem = currentLastKey ? this.#toc.get(currentLastKey) : null;
			if (currentLastKey && currentLastItem?.prevId === id && this.#reachedBottom) {
				this.#mostRecentKey = currentLastKey;
				return;
			}

			if (item.prevId && scrolledUp) {
				const previous = this.#toc.get(item.prevId);
				if (previous && !previous.isIntersectingPriority) this.#mostRecentKey = previous.id;
			}
		});
	};

	readonly bottomIntersectionCallback = (entries: IntersectionObserverEntry[]) => {
		entries.forEach((entry) => {
			if (this.#toc.size === 0 || !this.#lastKey) return;

			this.#reachedBottom = entry.isIntersecting;

			if (entry.isIntersecting) {
				this.#mostRecentKey = this.#lastKey;
				return;
			}

			if (this.#lastKey === this.routeHashKey && !entry.isIntersecting) {
				goto('', { noScroll: true, replaceState: true });
				return;
			}

			const currentLastItem = this.#toc.get(this.#lastKey);
			if (!currentLastItem || currentLastItem.isIntersectingPriority) return;
			if (this.#mostRecentKey !== this.#lastKey || !currentLastItem.prevId) return;

			let initialKey: string | null = null;
			for (const [key, { heading }] of this.#toc) {
				const top = heading.getBoundingClientRect().top - this.#getTopOffset();
				if (top <= 0) initialKey = key;
			}

			this.#mostRecentKey = initialKey;
		});
	};

	public update() {
		const container = this.#getContainer();
		if (!container) {
			this.reset();
			return;
		}

		const headings = [
			...container.querySelectorAll('h1, h2, h3, h4, h5, h6')
		] as HTMLHeadingElement[];

		this.#priorityViewObserver?.disconnect();
		this.#priorityViewObserver = new IntersectionObserver(
			this.priorityIntersectionCallback,
			this.#getObserverOptions()
		);

		this.#reachedBottomObserver?.disconnect();
		this.#reachedBottomObserver = null;
		if (this.#getDetectIfReachedBottom()) {
			const lastElementChild = container.lastElementChild;
			if (lastElementChild) {
				this.#reachedBottomObserver = new IntersectionObserver(
					this.bottomIntersectionCallback,
					this.#getReachedBottomObserverOptions()
				);
				this.#reachedBottomObserver.observe(lastElementChild);
			}
		}

		const filteredHeadings = headings.filter(
			(heading) => heading.dataset.ignoreToc !== 'true' && heading.id
		);

		const stack: Array<{ id: string; level: number }> = [];
		const seenIds = new Set<string>();
		const nextEntries: Array<[string, TOCItem]> = [];
		let initialKey: string | null = null;
		let previousId: string | undefined;
		let finalKey: string | null = null;

		filteredHeadings.forEach((heading) => {
			const level = Number(heading.tagName.slice(1));
			while (stack.length > 0 && level <= (stack.at(-1)?.level ?? 0)) stack.pop();

			const id = heading.id;
			if (seenIds.has(id)) {
				if (!this.#warnedDuplicateIds.has(id)) {
					console.warn(`Duplicate heading id "${id}" was ignored in table-of-contents.`);
					this.#warnedDuplicateIds.add(id);
				}
				return;
			}

			const item: TOCItem = {
				index: nextEntries.length,
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
			this.#priorityViewObserver?.observe(heading);

			const top = heading.getBoundingClientRect().top - this.#getTopOffset();
			if (top <= 0) initialKey = id;

			previousId = id;
			finalKey = id;
		});

		this.#toc.clear();
		for (const [key, item] of nextEntries) {
			this.#toc.set(key, item);
		}

		this.#reachedBottom = false;
		this.#mostRecentKey = initialKey;
		this.#lastKey = finalKey;
	}

	public handleAfterNavigate(type: string) {
		if (type === 'enter') {
			const element = document.getElementById(page.url.hash.replace('#', ''));
			element?.scrollIntoView();
			return;
		}

		if (type === 'link') {
			this.update();
		}
	}

	public destroy() {
		this.#priorityViewObserver?.disconnect();
		this.#priorityViewObserver = null;
		this.#reachedBottomObserver?.disconnect();
		this.#reachedBottomObserver = null;
		this.reset();
	}

	private reset() {
		this.#toc.clear();
		this.#reachedBottom = false;
		this.#mostRecentKey = null;
		this.#lastKey = null;
	}
}

const [getTOCContext, set] = createContext<TOCContext>();

export { getTOCContext };

export function setTOCContext(props: TOCContextProps) {
	return set(new TOCContext(props));
}
