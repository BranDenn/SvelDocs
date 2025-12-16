<script lang="ts">
	import Footer from '$components/footer/footer.svelte';
	import Header from '$components/header';
	import * as Sidebar from '$components/sidebar';
	import * as SearchDialog from '$components/search';

	let { children } = $props();
</script>

<SearchDialog.Provider>
	<Header />

	<div class="container flex grow">
		<Sidebar.Nav />

		<!-- must have min-w-0 to ensure middle content does not push sidebars -->
		<div
			class="flex w-full min-w-0 flex-col gap-4 p-4 wrap-break-word transition-[padding] md:p-8 md:pl-14"
			id="middle"
		>
			<main class="grow">
				{@render children?.()}
			</main>
			<Footer />
		</div>

		<Sidebar.TOC />
	</div>
</SearchDialog.Provider>
