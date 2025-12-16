<script lang="ts">
	import '$css';

	import { ModeWatcher } from 'mode-watcher';
	import * as Tooltip from '$ui/tooltip';

	let { children } = $props();
</script>

<ModeWatcher defaultMode="dark" />

<Tooltip.Provider delayDuration={150} disableCloseOnTriggerClick={true}>
	{@render children()}
</Tooltip.Provider>
