---
description: An ordered step list component for setup guides and workflow documentation.
---

import Alert from '$ui/alert';
import { Steps, Step } from '$ui/steps';

## Overview

`Steps` renders ordered instructions with consistent spacing and automatic numbering. It works well for setup guides and onboarding.

### Example

<Steps>
	<Step title="Install Dependencies">
		Install the project dependencies before starting the app.
	</Step>

	<Step title="Start the Dev Server">
		Launch the local site and confirm the documentation is loading.
	</Step>

	<Step title="Begin Editing Content">
		Add or update markdown files inside the content directory.
	</Step>
</Steps>

## Markdown Usage

Import the `Steps` and `Step` components into the markdown, then pass a `title` prop and the `Step` content as children:

```md
import { Steps, Step } from '$ui/steps';

<Steps>
	<Step title="Install Dependencies">
		Install the project dependencies before starting the app.
	</Step>

	<Step title="Start the Dev Server">
		Launch the local site and confirm the documentation is loading.
	</Step>

	<Step title="Begin Editing Content">
		Add or update markdown files inside the content directory.
	</Step>
</Steps>
```

### Starting at a Different Number

Use the `start` prop to start the first step at a specific number.

```md
import { Steps, Step } from '$ui/steps';

<Steps start={4}>
	<Step title="Install Dependencies">
		Install the project dependencies before starting the app.
	</Step>

	<Step title="Start the Dev Server">
		Launch the local site and confirm the documentation is loading.
	</Step>

	<Step title="Begin Editing Content">
		Add or update markdown files inside the content directory.
	</Step>
</Steps>
```

<Steps start={4}>
	<Step title="Install Dependencies">
		Install the project dependencies before starting the app.
	</Step>

	<Step title="Start the Dev Server">
		Launch the local site and confirm the documentation is loading.
	</Step>

	<Step title="Begin Editing Content">
		Add or update markdown files inside the content directory.
	</Step>
</Steps>

### Display in Table Of Contents

You can show each step as a header in the table of contents by adding a unique id to each step. The step titles are `h6` heading elements, so they will always have the highest padding in the table of contents.

```md
import { Steps, Step } from '$ui/steps';

<Steps>
	<Step id="install-dependencies" title="Install Dependencies">
		Install the project dependencies before starting the app.
	</Step>

	<Step id="start-dev-server" title="Start the Dev Server">
		Launch the local site and confirm the documentation is loading.
	</Step>

	<Step id="edit-content" title="Begin Editing Content">
		Add or update markdown files inside the content directory.
	</Step>
</Steps>
```

<Steps>
	<Step id="install-dependencies" title="Install Dependencies">
		Install the project dependencies before starting the app.
	</Step>

	<Step id="start-dev-server" title="Start the Dev Server">
		Launch the local site and confirm the documentation is loading.
	</Step>

	<Step id="edit-content" title="Begin Editing Content">
		Add or update markdown files inside the content directory.
	</Step>
</Steps>

## Editing the Component

`Steps` lives in `$lib/components/ui/steps`.

| File | Purpose |
|---|---|
| `steps.svelte` | Root ordered list wrapper and `start` handling |
| `steps-title.svelte` | Numbered step heading item |
| `steps-body.svelte` | Indented step content block |
| `steps-step.svelte` | Wraps the `steps-title` and `steps-body` inside one component for simpler markdown. |
| `index.ts` | Barrel exports |