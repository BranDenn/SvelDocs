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
				title: textWithMark(title, match),
				content: strippedContent(content, match),
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
 * Adds a <mark> html tag between found content.
 */
function textWithMark(text: string, match: string) {
	const regex = new RegExp(match, 'gi');
	return text.replace(regex, '<mark>$&</mark>');
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
	const regex = new RegExp(match, 'gi');
	const foundPosition: number = text.search(regex);

	// subtract 20 characters from front
	const start = Math.max(0, foundPosition - maxFront);

	// subtract from start to get remaining characters
	totalCharacters -= foundPosition - start;

	// add remaining characters to get end position
	const end: number = foundPosition + totalCharacters;

	// if there was more content at the beginning, then have leading ...
	let new_content = start > 0 ? '... ' : '';
	new_content += text.substring(start, end);

	// if there was more content at the end, then have trailing ...
	if (text.length > end) new_content += ' ...';

	// if the content was not found then return stripped text WITHOUT markers
	if (foundPosition < 0) return new_content;

	// if the content was found then return stripped text WITH markers
	return textWithMark(new_content, match);
}
