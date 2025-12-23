import type { RequestHandler, EntryGenerator } from './$types';

export const prerender = true;

export const GET: RequestHandler = async ({ params }) => {
    return new Response(params.slug, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	});
}