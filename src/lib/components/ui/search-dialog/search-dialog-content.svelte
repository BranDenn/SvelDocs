<script lang="ts">
	import * as Dialog from '$ui/dialog';
	import * as SearchDialog from '.';
	import { getSearch } from './search-context.svelte';
	import Highlighter from '$ui/highlighter';
	import { SearchInput } from '$ui/input';

	const searchContext = getSearch();

	const SEARCH_LINK_SELECTOR = '[data-search-dialog-link]';
	let resultsContainer = $state<HTMLDivElement | null>(null);
	let searchInput = $state<HTMLInputElement | null>(null);

	function setResultsContainer(node: HTMLDivElement) {
		resultsContainer = node;

		return () => {
			if (resultsContainer === node) {
				resultsContainer = null;
			}
		};
	}

	function getSearchLinks() {
		if (!resultsContainer) return [];
		return Array.from(resultsContainer.querySelectorAll<HTMLElement>(SEARCH_LINK_SELECTOR));
	}

	function getNavigableElements() {
		const links = getSearchLinks();
		return [searchInput, ...links].filter((item): item is HTMLElement => item !== null);
	}

	function keepFocusedElementVisible(element: HTMLElement) {
		if (!resultsContainer || element === searchInput) return;

		const sectionHeader = element.closest('section')?.querySelector('header');
		const stickyHeaderHeight =
			sectionHeader instanceof HTMLElement ? sectionHeader.getBoundingClientRect().height : 0;

		const containerRect = resultsContainer.getBoundingClientRect();
		const elementRect = element.getBoundingClientRect();
		const topBoundary = containerRect.top + stickyHeaderHeight;
		const bottomBoundary = containerRect.bottom;

		if (elementRect.top < topBoundary) {
			resultsContainer.scrollTop -= topBoundary - elementRect.top + 8;
			return;
		}

		if (elementRect.bottom > bottomBoundary) {
			resultsContainer.scrollTop += elementRect.bottom - bottomBoundary + 16;
		}
	}

	function handleArrowNavigation(event: KeyboardEvent) {
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

		const navigableElements = getNavigableElements();
		if (!navigableElements.length) return;

		const activeElement = document.activeElement;
		const activeIndex = navigableElements.indexOf(activeElement as HTMLElement);
		if (activeIndex === -1) {
			event.preventDefault();
			navigableElements[0]?.focus({ preventScroll: true });
			return;
		}

		const delta = event.key === 'ArrowDown' ? 1 : -1;
		let nextIndex: number | null = null;

		const candidateIndex = activeIndex + delta;

		if (candidateIndex >= 0 && candidateIndex < navigableElements.length) {
			nextIndex = candidateIndex;
		}

		if (nextIndex === null) return;

		event.preventDefault();
		const nextElement = navigableElements[nextIndex];
		nextElement?.focus({ preventScroll: true });

		if (nextElement) {
			keepFocusedElementVisible(nextElement);
		}
	}
</script>

<Dialog.Content
	hideClose
	class="top-4 translate-y-0 gap-0 overflow-y-hidden p-0 sm:top-[max(1rem,10%)] sm:max-h-[min(34rem,calc(100%-max(1rem,10%)-1rem))]"
	onkeydown={handleArrowNavigation}
>
	<div class="bg-secondary relative flex items-center gap-2 border-b p-2">
		<SearchInput
			bind:ref={searchInput}
			bind:value={searchContext.query}
			class="w-full border-none bg-transparent py-2 shadow-none"
		/>
		<Dialog.Close
			class="hover:bg-primary bg-background bg-card text-muted-foreground hover:bg-muted hover:text-foreground mr-2 rounded border px-1 py-0.5 text-xs shadow-xs transition-colors"
		>
			ESC
		</Dialog.Close>
	</div>
	<div {@attach setResultsContainer} class="scrollbar-thin relative overflow-y-auto">
		{#if !searchContext.query}
			{#each searchContext.getDefaultResults().entries() as [group, data] (group)}
				<SearchDialog.Section title={group} icon={data.icon}>
					{#each data.items as { title, href, icon } (href)}
						<SearchDialog.Link {href} {icon} {title} />
					{/each}
				</SearchDialog.Section>
			{/each}
		{:else if searchContext.results.size}
			{#each searchContext.results.entries() as [group, data] (group)}
				<SearchDialog.Section title={group} icon={data.icon}>
					{#each data.items as { title, href, description, icon } (href)}
						<SearchDialog.Link {href} {icon} {title}>
							<p class="text-muted-foreground">
								<Highlighter text={description} query={searchContext.cleanQuery} />
							</p>
						</SearchDialog.Link>
					{/each}
				</SearchDialog.Section>
			{/each}
		{:else}
			<p class="text-muted-foreground py-4 text-center">No results found.</p>
		{/if}
		{#if !searchContext.query || (searchContext.query && searchContext.results.size)}
			<div class="from-background pointer-events-none sticky bottom-0 h-4 bg-linear-to-t"></div>
		{/if}
	</div>
</Dialog.Content>
