import { Group, type NavGroup, type BaseSettings } from "$lib/docs";
import BookOpenCheck from "@lucide/svelte/icons/book-open-check"
import Rocket from "@lucide/svelte/icons/rocket"

// --- CHANGABLE SETTINGS
export const SETTINGS : BaseSettings = {
    NAV_STYLE: "button",
    SEARCH_BAR_LOCATION: "sidebar",
    COLLAPSIBLE_NAV_GROUPS: false,
    SHOW_NAV_ICONS: true,
}

// --- CHANGEABLE NAVIGATION
// this is neccessary to put group names 
export const NAVIGATION : NavGroup[] = [
    Group("Getting Started", { hide: true, group_href: false }).Items(
        { title: 'Introduction', icon: BookOpenCheck, href: "/docs" },
        { title: 'Quick Start', icon: Rocket }
    ),
    Group("Customization").Items(),
    Group("Features").Items(),
    Group("Credits").Items(),
]