---
description: Examples of markdown and their result.
---

<script lang="ts">
	import Alert from '$lib/components/ui/alert/alert.svelte'
	import H1 from '$lib/components/mdsx/headings/h1.svelte'
	import H2 from '$lib/components/mdsx/headings/h2.svelte'
	import H3 from '$lib/components/mdsx/headings/h3.svelte'
	import H4 from '$lib/components/mdsx/headings/h4.svelte'
	import H5 from '$lib/components/mdsx/headings/h5.svelte'
	import H6 from '$lib/components/mdsx/headings/h6.svelte'
</script>

## Headings

```markdown title=".md"
# h1 Heading
## h2 Heading
### h3 Heading
#### h4 Heading
#### h5 Heading
##### h6 Heading
```

<H1 class="toc-ignore">h1 Heading</H1>
<H2 class="toc-ignore">h2 Heading</H2>
<H3 class="toc-ignore">h3 Heading</H3>
<H4 class="toc-ignore">h4 Heading</H4>
<H5 class="toc-ignore">h5 Heading</H5>
<H6 class="toc-ignore">h6 Heading</H6>

## Styling Text

```markdown title=".md"
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

## Links

```md title=".md"
This is an [internal link](/docs)
This is an [external link](https://sveldocs.com)
```

This is an [internal link](/docs)\
This is an [external link](https://sveldocs.com)

## Line Breaks

```md title=".md"
This is a\\
line break
```

This is a\
line break

## Lists

#### Unordered List

```md title=".md"
- First
* Second
- Third
```

- First
* Second
- Third

#### Ordered List

```md title=".md"
1. First
2. Second
3. Third
```

1. First
2. Second
3. Third

#### Nested List

```md title=".md"
1. First
   - Second
     - Third
```

1. First
   - Second
     - Third

#### Task List

```md title=".md"
- [x] Complete
- [ ] Pending
```

- [x] Complete
- [ ] Pending

## Quote Blocks

#### Quoting Text

```md title=".md"
> This is a quote block example
```

> This a quote block example

#### Quoting Code

```md title=".md"
This is `quoted code`
```

This is `quoted code`

#### Quoting Code Blocks

````md title=".md"
This is a

```ts
var str: string = 'hello world';
console.log(str);
```
````

```ts
var str: string = 'hello world';
console.log(str);
```

## Tables

```md title=".md"
| Left-aligned | Center-aligned | Right-aligned |
| :----------- | :------------: | ------------: |
| 1            |       2        |             3 |
| 4            |       5        |             6 |
```

| Left-aligned | Center-aligned | Right-aligned |
| :----------- | :------------: | ------------: |
| 1            |       2        |             3 |
| 4            |       5        |             6 |

## Footnotes

```md title=".md"
Footnote[^first].
Footnote[^second].
[^first]: This links to the Footnote 1
[^second]: This links to the Footnote 2
```

Footnote[^first].
Footnote[^second].
[^first]: This links to the Footnote 1
[^second]: This links to the Footnote 2

## Alerts

Alerts are components to increase their customizability. View how to use them [here](/docs/components/alerts).

```svelte title=".md"
<script lang="ts">
	import Alert from '$lib/components/ui/alert/alert.svelte'
</script>

<Alert type="note">This is a note alert.</Alert>
<Alert type="tip">This is a tip alert.</Alert>
<Alert type="warning">This is a warning alert.</Alert>
<Alert type="caution">This is a caution alert.</Alert>
```

<Alert type="note">This is a note alert.</Alert>
<Alert type="tip">This is a tip alert.</Alert>
<Alert type="warning">This is a warning alert.</Alert>
<Alert type="caution">This is a caution alert.</Alert>