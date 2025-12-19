<script lang="ts">
	// custom highlight component to prevent potential @html injection issues

	import { escapeRegex } from '$utils';

	type Props = {
		text: string;
		query: string;
	};

	let { text, query }: Props = $props();

	let parts = $derived.by(() => {
		if (!query) return [text];

		try {
			const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
			return text.split(regex);
		} catch (e) {
			console.log('Invalid regex query', e);
			return [text];
		}
	});
</script>

{#each parts as part (part)}
	{#if part.toLowerCase() === query.toLowerCase()}
		<mark>{part}</mark>
	{:else}
		{part}
	{/if}
{/each}
