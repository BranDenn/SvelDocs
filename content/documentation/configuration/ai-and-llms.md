---
title: AI and LLMs
description: Configure the Markdown and llms.txt routes used by AI tools.
---

## Markdown Routes

Every public documentation page has a corresponding `.md` route. For example, `/docs/quick-start` is also available at `/docs/quick-start.md`.

The page menu can copy the Markdown, open it as plain text, or send its URL to ChatGPT or Claude. The prompt asks the provider to read and explain the page.

Provider definitions and URL construction are in `src/lib/docs/client/ai-provider-links.ts`.

## llms.txt

The `/llms.txt` route lists every public page with its title, Markdown URL, and description. AI tools can use this list to find your documentation.

The generated URLs use `origin` from `src/lib/configuration/site.config.ts`. Set it to the production origin, including any deployment base path:

```ts title="src/lib/configuration/site.config.ts"
const siteConfig = {
	name: 'SvelDocs',
	origin: 'https://example.com/docs',
	description: 'Documentation for your project.'
} as const;
```

Only public pages are included. The file is created during the build and can be cached for one hour.

## Adding a Provider

Only add a provider if its website can open with a prompt already filled in. Add it to `src/lib/docs/client/ai-provider-links.ts`, add its icon to the docs page, and add tests for its URL.

Provider URLs must use HTTPS. SvelDocs safely adds the page's `.md` URL to the prompt.