<script lang="ts">
	import '../app.css';

	import { ModeWatcher } from 'mode-watcher';
	import { Tooltip } from 'bits-ui';
	import { afterNavigate } from '$app/navigation';
	import { mount } from 'svelte';
	import CopyButton from '$lib/components/copy-button/copy-button.svelte';

	let { children } = $props();

	afterNavigate(loadCopyButtons);

	function loadCopyButtons() {
		for (const node of document.querySelectorAll('pre > code')) {
			const pre = node.parentElement;
			if (!pre || !node.textContent) continue

			pre.classList.add('relative', 'group');
			mount(CopyButton, {
				target: node.parentElement,
				props: {
					class: 'absolute top-2 right-2 z-10 opacity-0 transition group-hover:opacity-100',
					content: node.textContent,
				},
			});
		}
	}
</script>

<ModeWatcher />

<Tooltip.Provider delayDuration={150}>
	{@render children()}
</Tooltip.Provider>
