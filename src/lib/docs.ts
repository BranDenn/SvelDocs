import type { Component } from "svelte";

export interface BaseSettings {
    NAV_STYLE: "button" | "left-border" | null,
    SEARCH_BAR_LOCATION : "sidebar" | "header",
    COLLAPSIBLE_NAV_GROUPS : boolean;
    SHOW_NAV_ICONS: boolean;
}

export interface NavItem {
	title: string;
	icon?: Component;
	href?: string;
}

export class NavGroup {
	group: string;
	folder: string;
	hide: boolean;
	group_href: boolean;
	items: NavItem[] = [];

	constructor(g: string, params?: Partial<Omit<NavGroup, "items">>) {
		this.group = g;
		this.folder = params?.folder ?? g.replaceAll(' ', '-').toLowerCase();
		this.hide = params?.hide ?? false;
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
			const slug : string = this.group_href ? `${this.group}/` : '' + arg.title
			const href : string = `/docs/${slug}`.replaceAll(' ', '-').toLowerCase();

			arg.href = arg.href ?? href
		});
		
		return this
	}
}

export function Group(g: string, params?: Partial<Omit<NavGroup, "items">>) : NavGroup {
	return new NavGroup(g, params)
}