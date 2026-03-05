import { type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Check for the emulated-admin cookie
	const emulatedAdminCookie = event.cookies.get('emulated-admin');
	event.locals.emulated = emulatedAdminCookie === 'true';

	const response = await resolve(event);
	return response;
};
