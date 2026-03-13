<script lang="ts">
	import { escapeRegex } from '$utils';

	let { text, query } = $props();

	const normalized = $derived.by(() => {
		return {
			text: text == null ? '' : String(text),
			query: query == null ? '' : String(query)
		};
	});

	let parts = $derived.by(() => {
		if (!normalized.query) return [normalized.text];

		try {
			const regex = new RegExp(`(${escapeRegex(normalized.query)})`, 'gi');
			return normalized.text.split(regex);
		} catch (e) {
			console.log('Invalid regex query', e);
			return [normalized.text];
		}
	});
</script>

{#each parts as part, index (index)}
	{#if normalized.query && String(part).toLowerCase() === normalized.query.toLowerCase()}
		<mark>{part}</mark>
	{:else}
		{part}
	{/if}
{/each}
