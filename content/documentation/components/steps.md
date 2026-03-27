---
description: An ordered step list component for setup guides and workflow documentation.
---

import Alert from '$ui/alert';
import { Steps, StepBody, StepTitle } from '$ui/steps';

## Overview

`Steps` renders ordered instructions with consistent spacing and automatic numbering. It works well for setup guides and onboarding.

### Example

<Steps>
	<StepTitle>Install dependencies</StepTitle>
	<StepBody>Install the project dependencies before starting the app.</StepBody>

	<StepTitle>Start the dev server</StepTitle>
	<StepBody>Launch the local site and confirm the documentation is loading.</StepBody>

	<StepTitle>Begin editing content</StepTitle>
	<StepBody>Add or update markdown files inside the content directory.</StepBody>
</Steps>

## Markdown Usage

Import the primitives and alternate `StepTitle` with `StepBody` inside `Steps`:

```md
import { Steps, StepBody, StepTitle } from '$ui/steps';

<Steps>
	<StepTitle>Install dependencies</StepTitle>
	<StepBody>Run bun install to install the project dependencies.</StepBody>

	<StepTitle>Start the dev server</StepTitle>
	<StepBody>Run bun run dev and open the local site in your browser.</StepBody>
</Steps>
```

## Starting at a Different Number

Use the `start` prop to start the first step at a specific number.

<Steps start={4}>
	<StepTitle>Configure deployment</StepTitle>
	<StepBody>Apply environment-specific settings after the earlier steps are complete.</StepBody>

	<StepTitle>Run a production build</StepTitle>
	<StepBody>Verify the site compiles cleanly before deployment.</StepBody>
</Steps>

```md
import { Steps, StepBody, StepTitle } from '$ui/steps';

<Steps start={4}>
	<StepTitle>Configure deployment</StepTitle>
	<StepBody>Apply environment-specific settings after the earlier steps are complete.</StepBody>

	<StepTitle>Run a production build</StepTitle>
	<StepBody>Verify the site compiles cleanly before deployment.</StepBody>
</Steps>
```

## Editing the Component

`Steps` lives in `$lib/components/ui/steps`.

| File | Purpose |
|---|---|
| `steps-root.svelte` | Root ordered list wrapper and `start` handling |
| `steps-title.svelte` | Numbered step heading item |
| `steps-body.svelte` | Indented step content block |
| `index.ts` | Barrel exports |

<Alert type="note">
	Editing the `steps-title.svelte` component with vite's hot module reload can result in increments in its number. This does does not actually affect the built site.
</Alert>