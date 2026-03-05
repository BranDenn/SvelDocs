# SvelteKit Unified AST Architecture Summary

This architecture provides a secure, high-performance method for rendering Markdown as stateful Svelte components. It supports both **Static Site Generation (SSG)** for public pages and **Authenticated Server-Side Rendering (SSR)** for gated content.

## 1. Core Logic: Markdown to HAST (AST)
Instead of converting Markdown to a static HTML string, we parse it into a **HAST (HTML Abstract Syntax Tree)** JSON object.
- **Security:** Prevents XSS by avoiding `{@html}`.
- **Interactivity:** Allows mapping specific JSON nodes (like `<a>` or `<code>`) to interactive Svelte components.
- **Efficiency:** The heavy parser (Unified/Remark/Rehype) runs only at build-time (Vite) or server-side (SSR).

```ts
// mdsx.config.ts
import remarkGfm from 'remark-gfm';
import githubTheme from 'shiki/themes/github-dark.mjs';
import { Counter } from '$lib/components/Counter.svelte';

export const mdsxConfig = {
    extensions: ['.md', '.mdx'],
    // Global components mapping for the Renderer
    components: {
        Counter,
        a: '$lib/components/CustomLink.svelte' 
    },
    remarkPlugins: [
		remarkGfm,
		[
			remarkRehype,
			{
				footnoteBackContent: '↩\u{FE0E}' // fix to prevent default emoji icon
			}
		]
	],
    rehypePlugins: [
		rehypeSlug,
		[
			rehypePrettyCode,
			{
				theme: {
					light: 'github-light',
					dark: 'github-dark'
				},
				keepBackground: false
			}
		]
	],
    // Layouts/Blueprints for different content types
    blueprints: {
        default: '$lib/layouts/DefaultPost.svelte',
        newsletter: '$lib/layouts/Newsletter.svelte'
    }
}
```

## 2. The Vite Transformation Plugin
To automate the conversion, we use a custom Vite plugin. This treats `.md` files as virtual modules that export their own **AST** and **Metadata (Frontmatter)**.

```ts
// plugins/vite-md-to-ast.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkRehype from 'remark-rehype';
import matter from 'gray-matter';

export function mdToAst(config = {}) {
	const { remarkPlugins = [], rehypePlugins = [], extensions = ['.md'] } = config;

	return {
		name: 'vite-plugin-md-to-ast',
		async transform(code, id) {
			if (!extensions.some((ext) => id.endsWith(ext))) return null;

			// 1. Parse Frontmatter
			const { data: metadata, content } = matter(code);

			// 2. Initialize Unified with Markdown/MDX parsing
			let processor = unified().use(remarkParse).use(remarkMdx);

			// 3. Inject User Remark Plugins
			remarkPlugins.forEach((p) => {
				Array.isArray(p) ? processor.use(...p) : processor.use(p);
			});

			// 4. Bridge to Rehype (HTML AST)
			// Pass-through MDX elements so the Renderer can handle them as Svelte components
			processor.use(remarkRehype, {
				passThrough: ['mdxJsxFlowElement', 'mdxJsxTextElement']
			});

			// 5. Inject User Rehype Plugins (Slug, PrettyCode, etc.)
			rehypePlugins.forEach((p) => {
				Array.isArray(p) ? processor.use(...p) : processor.use(p);
			});

			// 6. Run the processor and generate the JSON AST
			const ast = await processor.run(processor.parse(content));

			return {
				code: `export default ${JSON.stringify({ ast, metadata })};`,
				map: null
			};
		}
	};
}
```


```ts
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdToAst } from './plugins/vite-md-to-ast.js';
import { mdsxConfig } from './mdsx.config.js'; // Your specific config file

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    extensions: ['.svelte', ...mdsxConfig.extensions],
    kit: {
        adapter: adapter(),
        alias: {
            $content: 'src/content'
        }
    },
    vite: {
        plugins: [mdToAst(mdsxConfig)] // Pass the config here!
    }
};

export default config;

```

## 3. The Hybrid Route Strategy (+page.server.ts)
A single route handles both public (prerendered) and private (SSR) content.
- Static Content: Use the entries() function to specify which slugs to bake into HTML at build time.
- Private Content: Slugs not in entries() are handled dynamically, allowing for server-side auth checks.

```ts
// src/routes/blog/[slug]/+page.server.ts
export const load = async ({ params, locals }) => {
  // 1. Auth Logic (example: prefix private posts with 'private-')
  const isPrivate = params.slug.startsWith('private-');
  if (isPrivate && !locals.user) throw error(401, 'Unauthorized');

  try {
    // 2. Vite Import: Plugin converts .md to an AST object automatically
    const post = await import(`../../../content/${params.slug}.md`);
    return { 
        ast: post.default.ast, 
        metadata: post.default.metadata 
    };
  } catch (e) {
    throw error(404, 'Post not found');
  }
};
```

## 4. The Recursive Renderer (Node.svelte)
This component iterates through the AST and decides which Svelte component to render for each tag.

```svelte
<!-- src/lib/components/renderer/Node.svelte -->
<script>
	import Counter from '$lib/components/Counter.svelte';
	export let node;

	// Registry for Svelte components
	const componentMap = {
		Counter, // Maps <Counter /> in MDX
		// You can also map standard tags to Svelte components
		// pre: MyCustomCodeBlock 
	};

	// Helper to extract props from MDX attributes
	function getMdxProps(attrs = []) {
		return attrs.reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {});
	}
</script>

{#if node.type === 'text'}
	{node.value}

{:else if node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement'}
	<!-- MDX Components -->
	<svelte:component this={componentMap[node.name]} {...getMdxProps(node.attributes)}>
		{#each node.children as child}<svelte:self node={child} />{/each}
	</svelte:component>

{:else if node.type === 'element'}
	<!-- Standard HTML Elements (p, h1, div, etc.) -->
	<svelte:component this={node.tagName} {...node.properties}>
		{#if node.children}
			{#each node.children as child}<svelte:self node={child} />{/each}
		{/if}
	</svelte:component>
{/if}
```

## 5. Security & Performance
- Zero-Guess Filenames: Markdown is kept in /src/content/, which is not served statically.
- Server-Side Only: Content is only fetched and parsed in +page.server.ts, ensuring raw files are never exposed to the browser.
- Zero Bundle Overhead: The Unified library is a dev-dependency used only by Vite; it is never shipped to the client.
- HMR: Editing Markdown files triggers instant updates during development.