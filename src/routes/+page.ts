import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { SETTINGS } from '$settings';

export const load: PageLoad = ({ url }) => {
	if (!SETTINGS.REDIRECT_URL) return;
	if (url.pathname === SETTINGS.REDIRECT_URL) return;

	redirect(308, SETTINGS.REDIRECT_URL);
};
