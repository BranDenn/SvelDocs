<script lang="ts">
	import '../app.css';

	import { ModeWatcher } from 'mode-watcher';
	import { Tooltip } from 'bits-ui';

	let { children } = $props();
</script>

<ModeWatcher defaultMode="dark" />

<Tooltip.Provider delayDuration={150} disableCloseOnTriggerClick={true}>
	{@render children()}
</Tooltip.Provider>
