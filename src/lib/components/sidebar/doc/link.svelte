<script lang="ts">
	import { page } from "$app/state";
    import type { NavItem } from "$lib/docs";

    let { title, href, icon: Icon } :  NavItem = $props()

    let isActive : boolean = $derived(page.url.pathname === href)
</script>

<!-- <a href={href} class={["rounded-lg py-1.5 px-4 transition-all", page.url.pathname === href ? "bg-accent/10 text-accent font-bold" : "text-secondary hover:bg-secondary/10 hover:text-primary", Icon && "flex items-center gap-2"]}>
    {#if Icon && SETTINGS.SHOW_NAV_ICONS}
        <Icon class="size-4" />
    {/if}
    {title}
</a> -->

<a href={href} class={["border-l py-1.5 px-4 transition-all", isActive ? "text-accent font-bold border-accent [&>svg]" : "text-secondary hover:text-primary hover:border-secondary", Icon && "flex items-center gap-2"]}>
    {#if Icon}
        <Icon class={["size-4", isActive && "stroke-[2.5]"]} />
    {/if}
    {title}
</a>