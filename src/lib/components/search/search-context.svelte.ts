import { createContext, type Component } from 'svelte';
import { Document } from 'flexsearch';
import type { Pathname } from '$app/types';

type IndexData = {
	title: string;
	group: string;
	content: string;
};

type InputData = {
	href: Pathname;
	icon?: string | Component;
} & IndexData;

type OutputData = Omit<InputData, 'group'> & { icon?: string | Component };

export class Search {
	private readonly index = new Document<IndexData>({
		tokenize: 'full',
		document: {
			id: 'href',
			index: ['title', 'group', 'content'],
			store: ['title', 'group', 'content']
		}
	});
	public query = $state('');
	public results = $derived(this.getResults(this.query));

	private readonly itemIconMap = new Map<Pathname, OutputData['icon']>();

	public addToIndex(...data: InputData[]) {
		for (const d of data) {
			const { icon, ...rest } = d;
			if (icon && !this.itemIconMap.has(rest.href)) {
				this.itemIconMap.set(rest.href, icon);
			}
			this.index.add(rest);
		}
	}

	private getResults(q: string) {
		// clean text
		let match = q.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
		match = match.replaceAll(/\s+/g, ' ').trim();

		// create a map to group the results
		const groupedResults: Map<any, OutputData[]> = new Map();

		if (!match) return groupedResults;

		// return most relevant results
		const indexResults = this.index.search(match, {
			limit: 10,
			merge: true,
			enrich: true,
			highlight: { template: '<mark>$1</mark>', boundary: 80 }
		});

		for (const result of indexResults) {
			if (!result.doc) continue;

			const href = result.id as Pathname;
			const { group, title, content } = { ...result.doc, ...result.highlight };

			if (!groupedResults.has(group)) groupedResults.set(group, []);

			const itemIcon = this.itemIconMap.get(href);
			const data = groupedResults.get(group);
			data?.push({ href, title, content, icon: itemIcon });
		}

		return groupedResults;
	}
}

const [getSearchContext, set] = createContext<Search>();

export { getSearchContext };

export function setSearchContext() {
	return set(new Search());
}
