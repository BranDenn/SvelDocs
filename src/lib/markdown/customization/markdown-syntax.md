---
description: Examples of markdown and their result.
---

## Headings

```markdown title=".md"
# h1 Heading
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading
```

<h1 class="toc-ignore">h1 heading</h1>
<h2 class="toc-ignore">h2 heading</h2>
<h3 class="toc-ignore">h3 heading</h3>
<h4 class="toc-ignore">h4 heading</h4>
<h5 class="toc-ignore">h5 heading</h5>
<h6 class="toc-ignore">h6 heading</h6>

## Styling Text

```markdown title=".md"
This is **bold text** (or **bold text**)
This is _italic text_ (or _italic text_)
This is ~strikethrough text~ (or ~~strikethrough text~~)
This is **_bold & italic text_**
This is <sub>subscript text</sub>
This is <sup>supercript text<sup>
This is <ins>underline text<ins>
```

This is **bold text**
This is _italic text_
This is ~strikethrough text~
This is **_bold & italic text_**
This is <sub>subscript text</sub>
This is <sup>supercript text<sup>
This is <ins>underline text<ins>

## Links

```markdown title=".md"
This is a [link](https://sveldocs.com)
```

This is a [link](/)

## Line Breaks

```markdown title=".md"
This is a\
line break
```

This is a\
line break

## Lists

##### Unordered List

```markdown title=".md"
- First
* Second
- Third
```

- First
* Second
- Third

##### Ordered List

```markdown title=".md"
1. First
2. Second
3. Third
```

1. First
2. Second
3. Third

##### Nested List

```markdown title=".md"
1. First
   - Second
     - Third
```

1. First
   - Second
     - Third

##### Task List

```markdown title=".md"
- [x] Complete
- [ ] Pending
```

- [x] Complete
- [ ] Pending

## Quote Blocks

##### Quoting Text

```markdown title=".md"
> This is a quote block example
```

> This a quote block example

##### Quoting Code

```markdown title=".md"
This is `quoted code`
```

This is `quoted code`

##### Quoting Code Blocks

````markdown title=".md"
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

```markdown title=".md"
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

```markdown title=".md"
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

```markdown title=".md"
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
```

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
