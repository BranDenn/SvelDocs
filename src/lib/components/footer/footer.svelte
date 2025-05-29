<script lang="ts">
	import { page } from '$app/state';
	import { NavMap, type NavMapItem } from '$lib/docs';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
    import { SETTINGS } from '$settings';

	let { prev, next } = $derived(NavMap.get(page.url.pathname) ?? { prev: null, next: null });
</script>

<footer class="flex flex-col gap-4 text-sm">
    <div class="flex items-center gap-2">
        {#if prev}
            {@const { title, group } = NavMap.get(prev) as NavMapItem}
            <a href={prev} class="group mr-auto flex items-center gap-2 hover:text-accent">
                <ArrowLeft class="transition-all group-hover:mr-2 size-4 shrink-0" />
                <span class="transition-colors">{title}</span>
                <span class="hidden text-secondary sm:block">{group}</span>
            </a>
        {/if}
        {#if next}
            {@const { title, group } = NavMap.get(next) as NavMapItem}
            <a href={next} class="group flex items-center gap-2 hover:text-accent ml-auto">
                <span class="hidden text-secondary sm:block">{group}</span>
                <span class="transition-colors">{title}</span>
                <ArrowRight class="transition-all group-hover:ml-2 size-4 shrink-0" />
            </a>
        {/if}
    </div>
    <hr />
    <div class="flex flex-wrap items-center justify-between gap-2 text-secondary">

        {#if SETTINGS.COMPANY_NAME}
            <p>Copyright © {new Date().getFullYear()} {SETTINGS.COMPANY_NAME}</p>
        {/if}
        <p>Support Example</p>
    </div>
</footer>