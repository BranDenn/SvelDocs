import type { Actions } from './$types';

export const actions: Actions = {
	toggleEmulated: async ({ request, cookies }) => {
		const formData = await request.formData();
		const enabled = formData.get('enabled') === 'true';

		if (enabled) {
			cookies.set('emulated-admin', 'true', {
				path: '/',
				maxAge: 60 * 60 * 24 // 1 day
			});
		} else {
			cookies.delete('emulated-admin', { path: '/' });
		}

		return { success: true };
	}
};
