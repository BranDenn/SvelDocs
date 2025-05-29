import { Group, type NavGroup, loadNavMap, type BaseSettings } from "$lib/docs";
import BookOpenCheck from "@lucide/svelte/icons/book-open-check"
import Rocket from "@lucide/svelte/icons/rocket"

// --- CHANGABLE SETTINGS ---
export const SETTINGS : BaseSettings = {
    NAV_STYLE: "button",
    SEARCH_BAR_LOCATION: "sidebar",
    COLLAPSIBLE_NAV_GROUPS: false,
}

// --- CHANGEABLE NAVIGATION ---
// this is neccessary to put group names 
export const NAVIGATION : NavGroup[] = [
    Group("Getting Started", { show: false, group_href: false }).Items(
        { title: 'Introduction', icon: BookOpenCheck, href: "/docs" },
        { title: 'Quick Start', icon: Rocket },
        { title: 'Configuration' }
    ),
    Group("Customization").Items(
        { title: 'Themes' },
    ),
    Group("Features").Items(),
    Group("Credits").Items(),
]

// --- LOAD NAVIGATION MAP ---
// this is neccessary to get the navigation data based off the url pathname
loadNavMap(NAVIGATION);