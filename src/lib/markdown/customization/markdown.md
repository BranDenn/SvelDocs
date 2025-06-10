---
description: Customizing the markdown content.
---

## Alerts

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

## TS

```ts {1-2,4} title="Title"
let t = 'variable name';
t += ' some new test';

const test: number = 5;
```

## CSS

```css title="Title" caption="Caption" showLineNumbers
@layer base {
	.dark {
		/* dark mode colors */
		--color-background: var(--color-zinc-950);
		--color-foreground: var(--color-zinc-900);
		--color-border: var(--color-zinc-800);
		--color-primary: var(--color-zinc-200);
		--color-secondary: var(--color-zinc-400);
		--color-accent: var(--color-blue-400);
	}
}
```

# 1

## 2

### 3

#### 4

##### 5

###### 6
