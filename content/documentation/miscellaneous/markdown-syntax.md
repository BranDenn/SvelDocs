---
description: Examples of markdown and their result.
---

## Headings

```md
# h1 Heading

## h2 Heading

### h3 Heading

#### h4 Heading

#### h5 Heading

##### h6 Heading
```

import H1 from '$lib/markdown/components/headings/h1.svelte';
<H1 ignoreToc>h1 Heading</H1>

import H2 from '$lib/markdown/components/headings/h2.svelte';
<H2 ignoreToc>h2 Heading</H2>

import H3 from '$lib/markdown/components/headings/h3.svelte';
<H3 ignoreToc>h3 Heading</H3>

import H4 from '$lib/markdown/components/headings/h4.svelte';
<H4 ignoreToc>h4 Heading</H4>

import H5 from '$lib/markdown/components/headings/h5.svelte';
<H5 ignoreToc>h5 Heading</H5>

import H6 from '$lib/markdown/components/headings/h6.svelte';
<H6 ignoreToc>h6 Heading</H6>

---

## Styling Text

```md
This is **bold text** (or **bold text**)
This is _italic text_ (or _italic text_)
This is ~strikethrough text~ (or ~~strikethrough text~~)
This is **_bold & italic text_**
This is <sub>subscript text</sub>
This is <sup>supercript text</sup>
This is <ins>underline text</ins>
```

This is **bold text**\
This is _italic text_\
This is ~strikethrough text~\
This is **_bold & italic text_**\
This is <sub>subscript text</sub>\
This is <sup>supercript text</sup>\
This is <ins>underline text</ins>

---

## Links

```md
This is an [internal link](/docs)
This is an [external link](https://sveldocs.com)
```

This is an [internal link](/docs)\
This is an [external link](https://sveldocs.com)

---

## Line Breaks

```md
This is a\\
line break
```

This is a\
line break

---

## Lists

#### Unordered List

```md
- First
- Second
- Third
```

- First
- Second
- Third

#### Ordered List

```md
1. First
2. Second
3. Third
```

1. First
2. Second
3. Third

#### Nested List

```md
1. First
	- Second
    	- Third
```

1. First
	- Second
    	- Third

#### Task List

```md
- [x] Complete
- [ ] Pending
```

- [x] Complete
- [ ] Pending

---

## Quote Blocks

#### Quoting Text

```md
> This is a quote block example
```

> This a quote block example

#### Quoting Code

```md
This is `quoted code`
```

This is `quoted code`

#### Quoting Code Blocks

````md
This is a code block:

```ts
var str: string = 'hello world';
console.log(str);
```
````

This is a code block:

```ts
var str: string = 'hello world';
console.log(str);
```

---

## Tables

```md
| Left-aligned | Center-aligned | Right-aligned |
| :----------- | :------------: | ------------: |
| 1            |       2        |             3 |
| 4            |       5        |             6 |
```

| Left-aligned | Center-aligned | Right-aligned |
| :----------- | :------------: | ------------: |
| 1            |       2        |             3 |
| 4            |       5        |             6 |

---

## Footnotes

```md
Footnote[^first].
Footnote[^second].
[^first]: This links to the Footnote 1
[^second]: This links to the Footnote 2
```

Footnote[^first].
Footnote[^second].
[^first]: This links to the Footnote 1
[^second]: This links to the Footnote 2

---

## Alerts

Alerts are components to increase their customizability. View how to use them [here](/docs/components/alert).

```svelte
import Alert from '$ui/alert';

<Alert type="note">This is a note alert.</Alert>
<Alert type="tip">This is a tip alert.</Alert>
<Alert type="warning">This is a warning alert.</Alert>
<Alert type="caution">This is a caution alert.</Alert>
```

import Alert from '$ui/alert';

<Alert type="note">This is a note alert.</Alert>
<Alert type="tip">This is a tip alert.</Alert>
<Alert type="warning">This is a warning alert.</Alert>
<Alert type="caution">This is a caution alert.</Alert>