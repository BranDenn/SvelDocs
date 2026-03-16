import { createContext, type Component } from 'svelte';
import { Document } from 'flexsearch';
import type { Pathname } from '$app/types';
import { stripContent } from '$utils';

export const SEARCH_KEYBOARD_SHORTCUT = 'k';

export type SearchProps = {
	getOpen: () => boolean;
	setOpen: (open: boolean) => void;
};

/**
 * Search props for flexsearch Document indexing.
 */
export type IndexData = {
	href: Pathname;
	group: string;
	title: string;
	description: string;
	keywords?: string[];
};

/**
 * Item data that can be added to search used in the `addItem` function
 */
export type ItemInputData = {
	icon?: string | Component;
} & IndexData;

/**
 * Group data that can be added to search used in the `addGroup` function
 */
export type GroupInputData = {
	title: string;
	icon?: string | Component;
	items: Omit<ItemInputData, 'group'>[];
};

/**
 * Output data for search results grouped by group title used in the `getResults` function
 */
export type OutputData = {
	icon?: string | Component;
	items: Omit<ItemInputData, 'group' | 'keywords'>[];
};

export class Search {
	// dialog
	readonly #getOpen: SearchProps['getOpen'];
	readonly #setOpen: SearchProps['setOpen'];
	readonly #updateCallbacks = new Set<() => void>();

	// search
	public index = this.createSearchIndex();

	// store data locally to ensure consistency and O(1) retrieval of data
	// allows for data that flexsearch doesn't provide (like custom types such as Components for icons)
	private readonly itemMap = new Map<Pathname, Omit<ItemInputData, 'href'>>();
	private readonly groupMap = new Map<string, Omit<GroupInputData, 'title' | 'items'>>();

	public query = $state('');
	public cleanQuery = $derived(this.query.replaceAll(/\s+/g, ' ').trim());
	public results = $derived(this.getResults(this.cleanQuery));

	constructor(props: SearchProps) {
		this.#getOpen = props.getOpen;
		this.#setOpen = props.setOpen;
	}

	private createSearchIndex() {
		return new Document<IndexData>({
			tokenize: 'full',
			document: {
				id: 'href',
				index: ['group', 'title', 'description', 'keywords']
			}
		});
	}

	public addGroup(...data: GroupInputData[]) {
		for (const group of data) {
			this.groupMap.set(group.title, { icon: group.icon });

			for (const item of group.items) {
				this.addItem({ group: group.title, ...item });
			}
		}
	}

	public addItem(...data: ItemInputData[]) {
		for (const item of data) {
			const { href, icon, ...rest } = item;
			this.itemMap.set(href, { icon, ...rest });
			this.index.add({ href, ...rest });
		}
	}

	public getDefaultResults() {
		const groupedResults: Map<string, OutputData> = new Map();

		for (const [href, data] of this.itemMap.entries()) {
			if (!groupedResults.has(data.group)) {
				const groupData = this.groupMap.get(data.group);
				groupedResults.set(data.group, { items: [], ...groupData });
			}

			const items = groupedResults.get(data.group)?.items;
			items?.push({ href, ...data });
		}

		return groupedResults;
	}

	public getResults(q: string, limit = 10) {
		// create a map to group the results
		const groupedResults: Map<string, OutputData> = new Map();

		if (!q) return groupedResults;

		// return most relevant results
		const indexResults = this.index.search(q, {
			limit,
			merge: true,
			enrich: false
		});

		for (const result of indexResults) {
			const href = result.id as Pathname;
			const data = this.itemMap.get(href);

			if (!data) continue;

			if (!groupedResults.has(data.group)) {
				const groupData = this.groupMap.get(data.group);
				groupedResults.set(data.group, { items: [], ...groupData });
			}

			const items = groupedResults.get(data.group)?.items;

			items?.push({
				href,
				title: data.title,
				description: stripContent(data.description, q),
				icon: data.icon
			});
		}

		return groupedResults;
	}

	public clearSearch() {
		this.index.clear();
		this.itemMap.clear();
		this.groupMap.clear();
		this.query = '';
	}

	public onUpdate(callback: () => void) {
		this.#updateCallbacks.add(callback);

		return () => {
			this.#updateCallbacks.delete(callback);
		};
	}

	public signalUpdate() {
		for (const callback of this.#updateCallbacks) {
			callback();
		}
	}

	get open(): boolean {
		return this.#getOpen();
	}

	set open(value: boolean) {
		this.#setOpen(value);
	}

	public toggle = () => (this.open = !this.open);

	public handleShortcutKeydown = (e: KeyboardEvent) => {
		if (e.key === SEARCH_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			this.toggle();
		}
	};
}

const [getSearch, set] = createContext<Search>();

export { getSearch };

export function setSearch(props: SearchProps) {
	return set(new Search(props));
}
