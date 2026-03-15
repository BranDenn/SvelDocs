<script lang="ts">
	import { escapeRegex } from '$utils';

	type Props = {
		text: string;
		query: string;
	};

	let { text, query }: Props = $props();

	const lowerText = $derived(text.toLowerCase());
	const lowerQuery = $derived(query.toLowerCase());

	let parts = $derived.by(() => {
		if (!query) return [text];

		try {
			const regex = new RegExp(`(${escapeRegex(lowerQuery)})`, 'gi');
			return lowerText.split(regex);
		} catch (e) {
			console.log('Invalid regex query', e);
			return [text];
		}
	});
</script>

{#each parts as part, index (index)}
	{#if part === lowerQuery}
		<mark>{part}</mark>
	{:else}
		{part}
	{/if}
{/each}
