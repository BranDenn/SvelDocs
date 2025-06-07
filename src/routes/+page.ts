import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { SETTINGS } from '$settings';

export const load: PageLoad = () => {
	if (SETTINGS.REDIRECT_URL) redirect(308, SETTINGS.REDIRECT_URL);
};
