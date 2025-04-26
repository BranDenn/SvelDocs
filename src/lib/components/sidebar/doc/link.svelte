<script lang="ts">
	import { page } from "$app/state";
    import { SETTINGS, type NavigationLink } from "$settings"

    let { title, href, icon: Icon } :  NavigationLink = $props()
</script>

<a href={href} class={["rounded-lg py-1.5 px-4 font-medium transition-colors", page.url.pathname === href ? "bg-accent/10 text-accent" : "text-secondary hover:bg-secondary/10 hover:text-primary", Icon && "flex items-center gap-2"]}>
    {#if Icon && SETTINGS.SHOW_NAV_ICONS}
        <Icon class="size-4" />
    {/if}
    {title}
</a>