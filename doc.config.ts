import { Group, type NavGroup, type BaseSettings } from "$lib/docs";
import BookOpenCheck from "@lucide/svelte/icons/book-open-check"
import Rocket from "@lucide/svelte/icons/rocket"
import Settings from "@lucide/svelte/icons/settings-2"

// --- CHANGABLE SETTINGS ---
export const SETTINGS : BaseSettings = {
    NAV_STYLE: "left-border",
    SEARCH_BAR_LOCATION: "sidebar",
    COLLAPSIBLE_NAV_GROUPS: true,
    REDIRECT: true,
}

// --- CHANGEABLE NAVIGATION ---
// this is neccessary to put group names 
export const NAVIGATION : NavGroup[] = [
    Group("Getting Started", { show: false, group_href: false }).Items(
        { title: 'Introduction', icon: BookOpenCheck, href: "/docs" },
        { title: 'Quick Start', icon: Rocket },
        { title: 'Configuration', icon: Settings }
    ),
    Group("Customization").Items(),
    Group("Features").Items(),
    Group("Credits").Items(),
]