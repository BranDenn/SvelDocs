<script lang="ts">
	import * as Dialog from '$ui/dialog';
	import * as SearchDialog from '.';
	import { getSearch } from './search-context.svelte';
	import Highlighter from '$ui/highlighter';
	import { SearchInput } from '$ui/input';

	const searchContext = getSearch();
</script>

<Dialog.Content
	hideClose
	class="top-4 translate-y-0 gap-0 overflow-y-hidden p-0 sm:top-[max(1rem,10%)] sm:max-h-[min(34rem,calc(100%-max(1rem,10%)-1rem))]"
>
	<div class="bg-secondary relative flex items-center gap-2 border-b p-2">
		<SearchInput
			bind:value={searchContext.query}
			class="w-full border-none bg-transparent py-2 shadow-none"
		/>
		<Dialog.Close
			class="hover:bg-primary bg-background bg-card text-muted-foreground hover:bg-muted hover:text-foreground mr-2 rounded border px-1 py-0.5 text-xs shadow-xs transition-colors"
		>
			ESC
		</Dialog.Close>
	</div>
	<div class="scrollbar-thin relative overflow-y-auto">
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
