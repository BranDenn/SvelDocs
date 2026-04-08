---
description: How to configure code blocks in markdown.
---

## Overview

SvelDocs uses [rehype-pretty-code](https://rehype-pretty.pages.dev/) in the markdown pipeline to transform fenced code blocks into themed, styleable HTML. The plugin uses [shiki](https://shiki.style/) behind the scenes.

## Theme

Edit the code block theme in the `src/lib/markdown/markdown.config.ts`. By default it uses the GitHub color theme, but you can use any theme supported by `shiki`.

```ts
import rehypePrettyCode from 'rehype-pretty-code';

const markdownConfig = defineConfig({
	...
	rehypePlugins: [
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
	]
});
```

## Component

`src/lib/markdown/components/code/pre.svelte` is the component that replaces the default html `<pre>` element. This allows for:

- Language Badge
- Code Copy Button
- CSS Styling

### Styling

Styling is configured within the component. You can style the component elements themselves inline, but `rehype-pretty-code` and `shiki` styling must be configured in the `style` section using `:global`.

Here is the provided default:

<FileReader
	file="src/lib/markdown/components/code/pre.svelte"
	regex="<style[^>]*>.*?</style>"
	regexFlags="s"
/>

## Markdown Features

Use fenced-code metadata to control each block from markdown:

````md
```ts
console.log('hello world');
```
````

```ts
console.log('hello world');
```

You can declare the language at top. `ts` is shortened for `typescript`.

### Title

You can add a title to the code block by adding title="your title here":

````md
```ts title="src/lib/my-awesome-file.ts"
console.log('hello world');
```
````

```ts title="src/lib/my-awesome-file.ts"
console.log('hello world');
```

### Footer (Caption)

You can add a caption to the code block by adding caption="your caption here":

````md
```ts caption="This runs during page load"
console.log('loaded');
```
````

```ts caption="This runs during page load"
console.log('loaded');
```

### Highlight Lines

You can highlight specific lines by using curly-brace ranges after the language:

````md
```ts {2,4-6}
const one = 1;
const two = 2;
const three = 3;
const four = 4;
const five = 5;
const six = 6;
```
````

```ts {2,4-6}
const one = 1;
const two = 2;
const three = 3;
const four = 4;
const five = 5;
const six = 6;
```

### Line Numbers

You can show line numbers by using `showLineNumbers`:

````md
```ts showLineNumbers
const one = 1;
const two = 2;
const three = 3;
const four = 4;
const five = 5;
const six = 6;
```
````

```ts showLineNumbers
const one = 1;
const two = 2;
const three = 3;
const four = 4;
const five = 5;
const six = 6;
```

You can start the line number at a specific number by using a curly-brace and a number:

````md
```ts showLineNumbers{5}
const one = 1;
const two = 2;
const three = 3;
const four = 4;
const five = 5;
const six = 6;
```
````

```ts showLineNumbers{5}
const one = 1;
const two = 2;
const three = 3;
const four = 4;
const five = 5;
const six = 6;
```

### Kitchen Sink

Here is an example of all the markdown features combined.

````md
```ts {2,4-6} title="kitchen-sink-example.ts" showLineNumbers
const one = 1;
const two = 2;
const three = 3;
const four = 4;
const five = 5;
const six = 6;
```
````

```ts {2,4-6} showLineNumbers title="kitchen-sink-example.ts" caption="example caption"
const one = 1;
const two = 2;
const three = 3;
const four = 4;
const five = 5;
const six = 6;
```

## File to Code Block

You can generate a code block from a file using the [File Reader component](/docs/components/file-reader).