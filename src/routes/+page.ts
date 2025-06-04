import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { SETTINGS } from '$settings';

export const load: PageLoad = ({ url }) => {
	if (SETTINGS.REDIRECT && url.pathname != '/docs') redirect(308, '/docs');
};