import { Index } from 'flexsearch';
import { NavMap } from '$lib/docs';
import type { Component } from 'svelte';

const searchIndex = new Index({ tokenize: "full"})

export function createSearchIndex() {
	NavMap.values().forEach(async ({ group, title, folder, mdTitle, mdDescription, mdContent }, i) => {
		const data = [group, title, folder, mdTitle ?? '', mdDescription ?? '', mdContent?.replace(/<\/?[^>]+(>|$)/g, '') ?? '']
		const search = data.join(' ')
		searchIndex.add(i, search)
	});
}

interface Result {
	href: string;
	icon?: Component;
	title: string;
	description: string;
}
export function getSearchResults(searchText: string) {
	const match = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const indexResults = searchIndex.search(match)

	console.log(indexResults)

	const groupedResults : Map<any, Result[]> = new Map()
	const navMap = Array.from(NavMap.entries())

	indexResults.forEach((i) => {
		console.log(navMap)

		const [href, navItem] = navMap[i as number]

		const group = textWithMark(navItem.group, match)
		if (!groupedResults.has(group)) groupedResults.set(group, [])

		const fullTitle = navItem.title + (navItem.mdTitle ? ` (${navItem.mdTitle})` : '')
		const fullContent = (navItem.mdDescription ?? '') + (navItem.mdContent ?? '')

		groupedResults.get(group)?.push(
		{ 
			href,
			icon: navItem.icon,
			title: textWithMark(fullTitle, match),
			description: strippedContent(fullContent, match)
		})
	})

	return groupedResults
}

function textWithMark(text: string, match: string) {
	const regex = new RegExp(match, 'gi');
	return text.replaceAll(regex, (match) => `<mark>${match}</mark>`);
}

function strippedContent(text: string, match: string) {
	const regex = new RegExp(match, 'gi');
	const found_position: number = text.search(regex);

	// ensure there will always be a total amount of characters to display
	let characters_remaining: number = 80;

	// subtract 20 characters from front
	const start = Math.max(0, found_position - 20);

	// subtract from start to get remaining characters
	characters_remaining -= found_position - start;

	// add remaining characters to get end position
	const end = found_position + characters_remaining;

	// if there was more content at the beginning, then have leading ...
	let new_content = start > 0 ? '... ' : '';
	new_content += text.substring(start, end);

	// if there was more content at the end, then have trailing ...
	if (text.length > end) new_content += ' ...';

	// if the content was not found then return stripped text WITHOUT markers
	if (found_position < 0) return new_content;

	// if the content was found then return stripped text WITH markers
	return textWithMark(new_content, match);
}