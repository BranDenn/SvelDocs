<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	import * as Tooltip from '$ui/tooltip';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
</script>

<Tooltip.Root>
	<Tooltip.Trigger
		onclick={toggleMode}
		class="text-muted-foreground hover:text-foreground grid aspect-square place-content-center overflow-hidden p-1 transition-colors"
	>
		<Sun
			class="size-4 translate-y-1/2 transition-[translate,opacity]! dark:translate-y-0 dark:opacity-0"
		/>
		<Moon
			class="size-4 opacity-0 transition-[translate,opacity]! dark:-translate-y-1/2 dark:opacity-100"
		/>
	</Tooltip.Trigger>
	<Tooltip.Content>Toggle Theme</Tooltip.Content>
</Tooltip.Root>
