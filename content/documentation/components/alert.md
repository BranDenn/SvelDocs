---
description: A callout component for notes, tips, warnings, and cautions.
---

import Alert from '$ui/alert';

## Overview

`Alert` renders colored callout blocks. Use it when content needs emphasis without breaking the reading flow.

### Example

<Alert type="note">This is a note alert.</Alert>
<Alert type="tip">This is a tip alert.</Alert>
<Alert type="warning">This is a warning alert.</Alert>
<Alert type="caution">This is a caution alert.</Alert>

## Markdown Usage

Import the `Alert` component into the markdown, then pass a `type` prop and the `Alert` content as children:

```md
import Alert from '$ui/alert';

<Alert type="note">This is a note alert.</Alert>
<Alert type="tip">This is a tip alert.</Alert>
<Alert type="warning">This is a warning alert.</Alert>
<Alert type="caution">This is a caution alert.</Alert>
```

## Setting a Custom Title

By default, the title is derived from the alert `type`. Use `title` when you need a more specific label.

```md
import Alert from '$ui/alert';

<Alert type="warning" title="Heads up">
	This alert uses a custom title.
</Alert>
```

<Alert type="warning" title="Heads up">This alert uses a custom title.</Alert>

## Props

| Prop | Type | Description |
|---|---|---|
| `type` | `'note' \| 'tip' \| 'warning' \| 'caution'` | Selects the icon, accent color, and default title |
| `title` | `string` | Optional custom heading shown above the content |
| `icon` | `Component` | Optional icon override |
| `class` | `ClassValue` | Optional classes passed to the root element |

## Editing the Component

`Alert` lives in `$lib/components/ui/alert`.

| File | Purpose |
|---|---|
| `alert.svelte` | Root alert component with icon, title, and body rendering |
| `index.ts` | Barrel export |