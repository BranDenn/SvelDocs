import { createContext, type Component } from 'svelte';
import { Document } from 'flexsearch';
import type { Pathname } from '$app/types';
import { escapeRegex } from '$utils';

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
	private readonly itemIconMap = new Map<Pathname, OutputData['icon']>();

	public query = $state('');
	public cleanQuery = $derived(this.query.replaceAll(/\s+/g, ' ').trim());
	public results = $derived(this.getResults(this.cleanQuery));

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
		// create a map to group the results
		const groupedResults: Map<string, OutputData[]> = new Map();

		if (!q) return groupedResults;

		// return most relevant results
		const indexResults = this.index.search(q, {
			limit: 10,
			merge: true,
			enrich: true
		});

		for (const result of indexResults) {
			if (!result.doc) continue;

			const href = result.id as Pathname;
			const { group, title, content } = result.doc;

			if (!groupedResults.has(group)) groupedResults.set(group, []);

			const itemIcon = this.itemIconMap.get(href);
			const data = groupedResults.get(group);
			data?.push({
				href,
				title: title,
				content: strippedContent(content, q),
				icon: itemIcon
			});
		}

		return groupedResults;
	}
}

const [getSearchContext, set] = createContext<Search>();

export { getSearchContext };

export function setSearchContext() {
	return set(new Search());
}

/**
 * Strips content and adds ellipses if over the character limit.
 */
function strippedContent(
	text: string,
	match: string,
	totalCharacters: number = 80,
	maxFront: number = 20
) {
	const regex = new RegExp(`(${escapeRegex(match)})`, 'gi');
	const foundPosition: number = text.search(regex);

	// subtract 20 characters from front
	const start = Math.max(0, foundPosition - maxFront);

	// subtract from start to get remaining characters
	totalCharacters -= foundPosition - start;

	// add remaining characters to get end position
	const end: number = foundPosition + totalCharacters;

	// if there was more content at the beginning, then have leading ...
	let newContent = start > 0 ? '... ' : '';
	newContent += text.substring(start, end);

	// if there was more content at the end, then have trailing ...
	if (text.length > end) newContent += ' ...';

	return newContent;
}
