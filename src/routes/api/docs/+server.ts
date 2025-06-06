import { json } from '@sveltejs/kit';
import { render } from 'svelte/server';
import { NAVIGATION } from '$settings';
import type { Doc } from '$lib/docs';

export const prerender = true;

export async function GET() {
    const modules = import.meta.glob('$lib/markdown/*/*.md', { eager: true });
    let docs : Doc[] = []

    NAVIGATION.forEach((navGroup) => {
        navGroup.items.forEach((navItem) => {
            const group = navGroup.group
            const folder = navGroup.folder
            const title = navItem.title

            let data : Doc = {
                group,
                title,
                slug: navItem.href
            }

            const file_name = title.toLowerCase().replaceAll(' ', '-');
            const module = modules[`/src/lib/markdown/${folder}/${file_name}.md`]

            if (module) {
                if (module.metadata) {
                    data.mdTitle = module.metadata?.title
                    data.mdDescription = module.metadata?.description
                }
                if (module.default) {
                    data.mdContent = render(module.default).body
                }
                
            }
        
            docs.push(data)
        });
    });

    return json(docs);
}