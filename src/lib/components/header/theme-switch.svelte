<script lang="ts">
	import { toggleMode, mode } from 'mode-watcher';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
</script>

<button
	aria-label="Toggle theme"
	onclick={toggleMode}
	class="text-secondary hover:text-primary grid aspect-square place-content-center overflow-hidden p-1 transition-colors"
>
	<Sun
		class={[mode.current != 'dark' ? 'translate-y-1/2' : 'opacity-0', 'size-5 transition-all']}
	/>
	<Moon
		class={[mode.current === 'dark' ? '-translate-y-1/2' : 'opacity-0', 'size-5 transition-all']}
	/>
</button>