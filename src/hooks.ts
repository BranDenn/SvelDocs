import { resolve } from '$app/paths';
import type { Reroute } from '@sveltejs/kit';

export const reroute: Reroute = ({ url }) => {
    if (url.pathname === '/[fallback]') return
    if (url.pathname === "/") return
    if (!url.pathname.startsWith("/")) return
	return resolve(`/${url.pathname}`)
};