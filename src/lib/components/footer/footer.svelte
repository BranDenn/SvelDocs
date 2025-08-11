<script lang="ts">
	import { page } from '$app/state';
	import { NavMap, type NavMapItem } from '$lib/docs';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { SETTINGS } from '$settings';
	import Link from '../ui/link/link.svelte';

	let { prev, next } = $derived(NavMap.get(`/${page.params.slug}`) ?? { prev: null, next: null });
</script>

<footer class="mt-4 flex flex-col gap-4 text-sm">
	<div class="flex flex-wrap items-center gap-2">
		{#if prev}
			{@const { title, group } = NavMap.get(prev) as NavMapItem}
			<Link href={prev} class="group hover:text-accent mr-auto flex items-center gap-2">
				<ArrowLeft class="size-4 shrink-0 transition-all group-hover:mr-2" />
				<span class="transition-colors">{title}</span>
				<span class="text-secondary hidden sm:block md:hidden lg:block">{group}</span>
			</Link>
		{/if}
		{#if next}
			{@const { title, group } = NavMap.get(next) as NavMapItem}
			<Link
				href={next}
				class="group hover:text-accent ml-auto flex items-center justify-between gap-2"
			>
				<span class="text-secondary hidden sm:block md:hidden lg:block">{group}</span>
				<span class="transition-colors">{title}</span>
				<ArrowRight class="size-4 shrink-0 transition-all group-hover:ml-2" />
			</Link>
		{/if}
	</div>
	<hr />
	<div class="text-secondary flex flex-wrap items-center justify-between gap-2">
		{#if SETTINGS.COMPANY_NAME}
			<p>Copyright © {new Date().getFullYear()} {SETTINGS.COMPANY_NAME}</p>
		{/if}
		<p>Support Example</p>
	</div>
</footer>
