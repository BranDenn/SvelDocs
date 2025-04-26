<script lang="ts">
	import Header from '$lib/components/header';
	import * as Sidebar from '$lib/components/sidebar'

	let { children } = $props();
</script>

<Header />

<div class="container flex grow">
	<Sidebar.Nav />

	<div class="flex p-8 flex-col grow gap-4">
		<main class="grow">

		</main>
		<footer class="flex flex-col gap-4 text-sm">
			<hr />
			<div class="flex flex-wrap items-center justify-between gap-2 text-secondary">
				<p>Copyright © 2024 (Company Name Here)</p>
				<p>Support Example</p>
			</div>
		</footer>
	</div>

	<Sidebar.TOC />
</div>