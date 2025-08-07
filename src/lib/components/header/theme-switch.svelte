<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
</script>

<button
	aria-label="Toggle theme"
	onclick={toggleMode}
	class="text-secondary hover:text-primary grid aspect-square place-content-center overflow-hidden p-1 transition-colors"
>
	<Sun class="size-5 translate-y-1/2 !transition-all dark:translate-y-0 dark:opacity-0" />
	<Moon class="size-5 opacity-0 !transition-all dark:-translate-y-1/2 dark:opacity-100" />
</button>
