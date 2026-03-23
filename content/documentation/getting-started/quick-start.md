---
description: How to clone the repo and get the boilerplate running.
---

## Setup

import * as Steps from '$ui/steps';

<Steps.Root>
	<Steps.Title>Clone the repository</Steps.Title>
	<Steps.Body>
		```bash
		git clone https://github.com/BranDenn/SvelDocs
		```
	</Steps.Body>

	<Steps.Title>Install packages</Steps.Title>
	<Steps.Body>
		<CodeGroup contextId="js-pkg-managers">
			```bash title="bun"
			bun install
			```

			```bash title="npm"
			npm install
			```

			```bash title="pnpm"
			pnpm install
			```
		</CodeGroup>
	</Steps.Body>

	<Steps.Title>Start the dev server</Steps.Title>
	<Steps.Body>
		<CodeGroup contextId="js-pkg-managers">
			```bash title="bun"
			bun run dev
			```

			```bash title="npm"
			npm run dev
			```

			```bash title="pnpm"
			pnpm run dev
			```
		</CodeGroup>
	</Steps.Body>
</Steps.Root>