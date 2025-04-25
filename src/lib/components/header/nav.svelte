<script lang="ts">
	import Logo from './logo.svelte';
	import ThemeSwitch from './theme-switch.svelte';
	import Github from './github.svelte';
</script>

<nav class="h-header container flex items-center justify-between px-4">
	<Logo />

	<div class="flex items-center gap-2">
		<ThemeSwitch />
		<Github />
	</div>
</nav>
