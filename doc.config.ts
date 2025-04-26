import type { Component } from "svelte";

export interface BaseSettings {
    NAV_STYLE: "button" | "left-border" | null,
    SEARCH_BAR_LOCATION : "sidebar" | "header",
    COLLAPSIBLE_NAV_GROUPS : boolean;
    SHOW_NAV_ICONS: boolean;
}

export interface NavigationLink {
    title: string;
    icon?: Component;
    href?: string;
}

export interface NavigationSettings {
    [key: string]: NavigationLink[]
}

export const SETTINGS : BaseSettings = {
    NAV_STYLE: "button",
    SEARCH_BAR_LOCATION: "sidebar",
    COLLAPSIBLE_NAV_GROUPS: false,
    SHOW_NAV_ICONS: true,
}

import BookOpenCheck from "@lucide/svelte/icons/book-open-check"
import Rocket from "@lucide/svelte/icons/rocket"
import Paintbrush from "@lucide/svelte/icons/paintbrush"

export const NAVIGATION : NavigationSettings = {
    'Getting Started': [
		{ title: 'Introduction', icon: BookOpenCheck, href: "/docs" },
		{ title: 'Quick Start', icon: Rocket }
	],
	Customization: [{ title: 'Style Examples', icon: Paintbrush }],
	Features: [{ title: 'Table of Contents' }],
	Credits: [{ title: 'Packages' }]
}

function autofill_hrefs() : void {
    for (const [group, navs] of Object.entries(NAVIGATION)) {
		for (const nav of navs) {
			if (!nav.href) nav.href = `/docs/${group}/${nav.title}`.replaceAll(' ', '-').toLowerCase();
		}
	}
}

autofill_hrefs()