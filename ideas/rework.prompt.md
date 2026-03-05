# Agent Build Plan: Secure SvelteKit AST Markdown Template

## Objective
Implement a SvelteKit architecture that transforms `.md` and `.mdx` files into a JSON Abstract Syntax Tree (AST) via a Vite plugin. This enables stateful, interactive components within Markdown while maintaining server-side authentication guards and zero-client-side-parser overhead.

## Phase 1: Core Dependencies
Install the Unified ecosystem and Shiki-based highlighting if it is not installed:
`bun install unified remark-parse remark-mdx remark-rehype rehype-slug rehype-pretty-code gray-matter shiki`

## Phase 2: Configuration Schema
1. **Define Config Helper**: Create `src/lib/markdown/markdown-config.ts` to export a `defineConfig` function for type-safe user configurations.
2. **User Config**: Create `markdown.config.ts` in the root using the following structure:
   - `extensions`: `['.md', '.mdx']`
   - `remarkPlugins`: `[remarkGfm, [remarkRehype, { footnoteBackContent: '↩\u{FE0E}'}]]`
   - `rehypePlugins`: `[rehypeSlug, [rehypePrettyCode, { theme: { light: 'github-light', dark: 'github-dark' }, keepBackground: false}]]`

## Phase 3: The Vite Transformer Plugin
Create `plugins/vite-md-to-ast.ts`. The plugin must:
1. Hook into `transform(code, id)`.
2. Check if `id` matches `markdownConfig.extensions`.
3. Use `gray-matter` to separate metadata from content.
4. Initialize a `unified()` processor.
5. Use `.use()` to dynamically inject plugins from `markdownConfig`.
6. **Critical**: Set `remarkRehype` with `passThrough: ['mdxJsxFlowElement', 'mdxJsxTextElement']` to preserve Svelte/JSX components in the AST.
7. Return a virtual JS module: `export default { ast, metadata };`.

## Phase 4: SvelteKit Integration
1. **Svelte Config**: Update `svelte.config.js` to:
   - Add `.md` and `.mdx` to `extensions` using the `markdownConfig`.
   - Add the `mdToAst(markdownConfig)` plugin to the `vite.plugins` array.

## Phase 5: The "Gatekeeper" Route
Implement `src/routes/(docs)/[slug=docs]/+page.server.ts` and `src/routes/(docs)/[slug=docs.md]/+server.ts`:
1. Use `export const entries` to list public slugs for **Static Site Generation (SSG)**.
2. Inside `load`:
   - Perform `locals` check for non-public slugs (**Authentication**).
   - Dynamically import the `.md` file (Vite converts this to the JSON AST at build/dev time).
   - Return `{ ast, metadata }`.

## Phase 6: The Recursive Renderer
Create `src/lib/markdown/BlueprintRenderer.svelte`:
1. Define a `componentMap` to link HTML tags (like `a`) or MDX tags (like `Counter`) to Svelte components.
2. Logic:
   - If `node.type === 'text'`, render value.
   - If `node.type === 'mdxJsxFlowElement'`, render `svelte:component` using `componentMap`.
   - If `node.type === 'element'`, render `svelte:component` using `node.tagName`.
   - Recursively call `<svelte:self />` for children nodes.

## Phase 7: Verification
1. **Dev Mode**: Verify Hot Module Replacement (HMR) when editing a `.md` file.
2. **Security**: Ensure raw `.md` files are not accessible via browser URL (keep them in `src/lib/content` for public and `src/lib/server/content` for private).
3. **Build**: Run `bun run build` and verify that no `remark` or `rehype` libraries are included in the client-side JS bundle.
