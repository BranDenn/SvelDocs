import type { Component } from "svelte";

export interface BaseSettings {
    NAV_STYLE: "button" | "left-border" | null,
    SEARCH_BAR_LOCATION : "sidebar" | "header",
    COLLAPSIBLE_NAV_GROUPS : boolean;
	COMPANY_NAME?: string; // The name of the company, used in the footer
}

export interface NavItem {
	title: string;
	icon?: Component;
	href?: string;
}

export class NavGroup {
	group: string; // The name of the group
	folder: string; // The corresponding markdown folder location
	show: boolean; // Determines if the group text will be shown in the navigation sidebar
	group_href: boolean; // Determines if the group will name will used in the link
	items: NavItem[] = []; // The navigation links in the group

	constructor(g: string, params?: Partial<Omit<NavGroup, "items">>) {
		this.group = g;
		this.folder = params?.folder ?? g.replaceAll(' ', '-').toLowerCase();
		this.show = params?.show ?? true;
		this.group_href = params?.group_href ?? true;
	}

	Items(...args: NavItem[]) { 
		if (args.length) this.items = args 
		else {
			// const paths = import.meta.glob(`$lib/markdown/${this.folder}/*.md`, { eager: true });
			// console.log(paths)
			this.items = []
		}

		args.forEach(arg => {
			const slug : string = (this.group_href ? `${this.group}/` : '') + arg.title
			const href : string = `/docs/${slug}`.replaceAll(' ', '-').toLowerCase();

			arg.href = arg.href ?? href
		});

		return this
	}
}

export function Group(g: string, params?: Partial<Omit<NavGroup, "items">>) : NavGroup {
	return new NavGroup(g, params)
}

export class NavMapItem {
	group: string;
	title: string;
	prev?: string;
	next?: string;

	constructor(g: string, title: string) {
		this.group = g;
		this.title = title;
	}
}

export const NavMap: Map<string, NavMapItem> = new Map();

export function loadNavMap(NAVIGATION: NavGroup[]) {
	NAVIGATION.forEach(group => {
		group.items.forEach(item => {
			NavMap.set(item.href as string, new NavMapItem(group.group, item.title));
		})
	});

	let previousMapPair: [string, NavMapItem] | null = null;
	
	for (const pair of NavMap) {
		if (previousMapPair) {
			const [currentKey, currentMapItem] = pair;
			const [previousKey, previousMapItem] = previousMapPair;

			previousMapItem.next = currentKey;
			currentMapItem.prev = previousKey;
		}
		previousMapPair = pair;
	}
}