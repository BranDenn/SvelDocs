<script lang="ts">
	import Footer from '$components/footer';
	import Header from '$components/header';
	import * as Sidebar from '$components/sidebar';
	import * as SearchDialog from '$components/search';
	import { NavMap } from '$lib/docs';

	let { children } = $props();
</script>

<SearchDialog.Provider
	onContextInit={(ctx) => {
		const keys = NavMap.keys();
		keys.forEach((key) => {
			const value = NavMap.get(key);
			if (!value) return;

			const { group, title, icon, markdown } = value;
			const fullTitle = title + (markdown?.title ? ` (${markdown.title})` : '');
			const fullContent = (markdown?.description ?? '') + (markdown?.content ?? '');

			ctx.addToIndex({ href: key, group, title: fullTitle, content: fullContent, icon });
		});
	}}
>
	<Header />

	<div class="relative container flex grow">
		<div
			class="from-accent/10 pointer-events-none absolute inset-0 z-20 max-h-256 bg-radial-[50%_50%_at_50%_0%]"
		></div>

		<Sidebar.Nav />

		<!-- must have min-w-0 to ensure middle content does not push sidebars -->
		<div class="flex w-full min-w-0 flex-col wrap-break-word">
			<div
				class="from-background top-mobile-header lg:top-desktop-header pointer-events-none sticky z-10 h-8 shrink-0 bg-linear-to-b transition-[top] duration-300"
			></div>
			<div
				id="content-area"
				class="flex grow flex-col gap-8 px-4 transition-[padding] md:px-14 lg:py-6"
			>
				<main class="grow">
					{@render children?.()}
				</main>
				<Footer />
			</div>
			<div
				class="from-background pointer-events-none sticky bottom-0 z-10 h-8 shrink-0 bg-linear-to-t"
			></div>
		</div>

		<Sidebar.TOC />
	</div>
</SearchDialog.Provider>
