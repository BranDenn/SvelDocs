<script lang="ts">
	import * as Dialog from '$ui/dialog';
	import Search from '@lucide/svelte/icons/search';
	import { NAVIGATION } from '$settings';
	import * as SearchDialog from '.';
	import { getSearchContext } from './search-context.svelte';

	const searchContext = getSearchContext();
</script>

<Dialog.Content
	hideClose
	class="top-4 z-100 translate-y-0 gap-0 overflow-y-hidden p-0 sm:top-[max(1rem,10%)] sm:max-h-[min(32rem,calc(100%-max(1rem,10%)-1rem))]"
>
	<div class="flex items-center gap-2 border-b px-4 py-2">
		<Search class="text-muted-foreground size-5 shrink-0" />
		<input
			bind:value={searchContext.query}
			placeholder="Search Documentation..."
			autocomplete="off"
			spellcheck="false"
			name="search"
			type="search"
			class="h-9 w-full truncate text-sm outline-none"
		/>
		<Dialog.Close
			class="text-muted-foreground hover:bg-background hover:text-foreground bg-primary rounded border px-1 py-0.5 text-xs shadow-xs transition-colors"
		>
			ESC
		</Dialog.Close>
	</div>
	<div class="scrollbar-thin relative overflow-y-auto">
		{#if !searchContext.query}
			{#each NAVIGATION as { items, group }}
				<SearchDialog.Section title={group}>
					{#each items as { title, href, icon }}
						<SearchDialog.Link {href} {icon} {title} />
					{/each}
				</SearchDialog.Section>
			{/each}
		{:else if searchContext.results.size}
			{#each searchContext.results.entries() as [group, items]}
				<SearchDialog.Section title={group}>
					{#each items as { title, href, content, icon }}
						<SearchDialog.Link {href} {icon} {title}>
							<p class="text-muted-foreground">{@html content}</p>
						</SearchDialog.Link>
					{/each}
				</SearchDialog.Section>
			{/each}
		{:else}
			<span class="text-center">No results found.</span>
		{/if}
		<!-- {#if query === ''}
			{#each NAVIGATION as { items, group }}
				<SearchDialog.Section title={group}>
					{#each items as { title, href, icon }}
						<SearchDialog.Link {href} {icon} {title} />
					{/each}
				</SearchDialog.Section>
			{/each}
		{:else if results.size > 0}
			{#each results.entries() as [group, items]}
				<SearchDialog.Section title={group}>
					{#each items as { title, href, description, icon }}
						<SearchDialog.Link {href} {icon} {title}>
							<p class="text-muted-foreground">{@html description}</p>
						</SearchDialog.Link>
					{/each}
				</SearchDialog.Section>
			{/each}
		{:else}
			<span class="text-center">No results found.</span>
		{/if} -->
		{#if !searchContext.query || (searchContext.query && searchContext.results.size)}
			<div class="from-background pointer-events-none sticky bottom-0 h-4 bg-linear-to-t"></div>
		{/if}
	</div>
</Dialog.Content>
