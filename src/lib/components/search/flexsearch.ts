import { Index } from 'flexsearch';
import { NavMap } from '$lib/docs';
import type { Component } from 'svelte';

// create flex search index
const searchIndex = new Index({ tokenize: 'full' });

/**
 * Adds search indexes to the FlexSearch from the NavMap.
 */
export function createSearchIndex(): void {
	NavMap.values().forEach(async ({ group, title, markdown }, i) => {
		let data = [group, title];
		if (markdown) Object.values(markdown).forEach((value) => data.push(value))
		console.log(data)
		searchIndex.add(i, data.join(' '));
	});
}

/**
 * Result that is retured in the serach results map object
 */
interface Result {
	href: string;
	icon?: Component;
	title: string;
	description: string;
}

/**
 * Returns a Map of the seach reults found from the entered text.
 */
export function getSearchResults(searchText: string): Map<any, Result[]> {
	let match = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	match = match.replace(/\s+/g, ' ').trim();
	const groupedResults: Map<any, Result[]> = new Map();

	if (!match) return groupedResults;

	const indexResults = searchIndex.search(match, { limit: 10 }) as number[];
	const navMap = Array.from(NavMap.entries());

	indexResults.forEach((i) => {
		const [href, navItem] = navMap[i];

		const group = textWithMark(navItem.group, match);
		if (!groupedResults.has(group)) groupedResults.set(group, []);

		const fullTitle = navItem.title + (navItem.markdown?.title ? ` (${navItem.markdown?.title})` : '');
		const fullContent = (navItem.markdown?.description ?? '') + (navItem.markdown?.description ?? '');

		groupedResults.get(group)?.push({
			href,
			icon: navItem.icon,
			title: textWithMark(fullTitle, match),
			description: strippedContent(fullContent, match)
		});
	});

	return groupedResults;
}

/**
 * Adds a <mark> html tag between found content.
 */
function textWithMark(text: string, match: string) {
	const regex = new RegExp(match, 'gi');
	return text.replaceAll(regex, (match) => `<mark>${match}</mark>`);
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
