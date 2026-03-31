---
description: A file tree component for displaying interactable file structures.
---

import { Tree, TreeFolder, TreeFile } from '$ui/tree';

## Overview

`File Tree` renders interactable file trees with nesting support. It is useful for showing folder or directory contents.

### Example

<Tree open>
    <TreeFolder name="Awesome Folder">
        <TreeFile name="awesome.config.ts"/>
        <TreeFile name="awesome-file.ts"/>
        <TreeFolder name="Awesome Nested Folder">
            <TreeFile name="really-awesome-file.ts"/>
        </TreeFolder>
    </TreeFolder>
    <TreeFile name="not-no-cool-file.ts"/>
</Tree>

## Markdown Usage

Import the `Tree`, `TreeFolder`, and `TreeFile` components into the markdown. Then pass `name` props for `TreeFolder` and `TreeFile`.

```md
import { Tree, TreeFolder, TreeFile } from '$ui/tree';

<Tree>
    <TreeFolder name="Awesome Folder">
        <TreeFile name="awesome.config.ts"/>
        <TreeFile name="awesome-file.ts"/>
        <TreeFolder name="Awesome Nested Folder">
            <TreeFile name="really-awesome-file.ts"/>
        </TreeFolder>
    </TreeFolder>
    <TreeFile name="not-no-cool-file.ts"/>
</Tree>
```

### Open Folders by Default

By default, folders start closed. You can default them to open by stating `open` in the `TreeFolder`.

```md {4}
import { Tree, TreeFolder, TreeFile } from '$ui/tree';

<Tree>
    <TreeFolder name="Default Open Folder" open>
        <TreeFile name="file.ts"/>
    </TreeFolder>
    <TreeFolder name="Default Closed Folder">
        <TreeFile name="file.ts"/>
    </TreeFolder>
</Tree>
```

<Tree>
    <TreeFolder name="Default Open Folder" open>
        <TreeFile name="file.ts"/>
    </TreeFolder>
    <TreeFolder name="Default Closed Folder">
        <TreeFile name="file.ts"/>
    </TreeFolder>
</Tree>

You can default every file to open by stating `open` in the `Tree` wrapper.

```md {3}
import { Tree, TreeFolder, TreeFile } from '$ui/tree';

<Tree open>
    <TreeFolder name="Default Open Folder 1">
        <TreeFile name="file.ts"/>
    </TreeFolder>
    <TreeFolder name="Default Open Folder 2">
        <TreeFile name="file.ts"/>
    </TreeFolder>
</Tree>
```

<Tree open>
    <TreeFolder name="Default Open Folder 1">
        <TreeFile name="file.ts"/>
    </TreeFolder>
    <TreeFolder name="Default Open Folder 2">
        <TreeFile name="file.ts"/>
    </TreeFolder>
</Tree>

### Disabling Interaction

By default, folders can be clicked to expand or collapse their file content. This can be disabled by stating `noInteraction` in the `TreeFolder`.

```md {4,7}
import { Tree, TreeFolder, TreeFile } from '$ui/tree';

<Tree>
    <TreeFolder name="Disabled Open Folder" open noInteraction>
        <TreeFile name="file.ts"/>
    </TreeFolder>
    <TreeFolder name="Disabled Closed Folder" noInteraction>
        <TreeFile name="file.ts"/>
    </TreeFolder>
</Tree
```

<Tree>
    <TreeFolder name="Disabled Open Folder" open noInteraction>
        <TreeFile name="file.ts"/>
    </TreeFolder>
    <TreeFolder name="Disabled Closed Folder" noInteraction>
        <TreeFile name="file.ts"/>
    </TreeFolder>
</Tree>

You can default every file to have disabled interaction by stating `noInteraction` in the `Tree` wrapper.

```md {3}
import { Tree, TreeFolder, TreeFile } from '$ui/tree';

<Tree noInteraction>
    <TreeFolder name="Disabled Open Folder" open>
        <TreeFile name="file.ts"/>
    </TreeFolder>
    <TreeFolder name="Disabled Closed Folder">
        <TreeFile name="file.ts"/>
    </TreeFolder>
</Tree
```

<Tree noInteraction>
    <TreeFolder name="Disabled Open Folder" open>
        <TreeFile name="file.ts"/>
    </TreeFolder>
    <TreeFolder name="Disabled Closed Folder">
        <TreeFile name="file.ts"/>
    </TreeFolder>
</Tree>

### Toolbar

You can add a toolbar with buttons to expand all and collapse all folders by stating `toolbar` in the `Tree` wrapper.

```md {3}
import { Tree, TreeFolder, TreeFile } from '$ui/tree';

<Tree toolbar>
    <TreeFolder name="Awesome Folder">
        <TreeFile name="awesome.config.ts"/>
        <TreeFile name="awesome-file.ts"/>
        <TreeFolder name="Awesome Nested Folder">
            <TreeFile name="really-awesome-file.ts"/>
        </TreeFolder>
    </TreeFolder>
    <TreeFile name="not-no-cool-file.ts"/>
</Tree>
```

<Tree toolbar>
    <TreeFolder name="Awesome Folder">
        <TreeFile name="awesome.config.ts"/>
        <TreeFile name="awesome-file.ts"/>
        <TreeFolder name="Awesome Nested Folder">
            <TreeFile name="really-awesome-file.ts"/>
        </TreeFolder>
    </TreeFolder>
    <TreeFile name="not-no-cool-file.ts"/>
</Tree>

## Editing the Component

`Tree` lives in `src/lib/components/ui/tree`.

| File | Purpose |
|---|---|
| `tree.svelte` | Tree wrapper and props for global contexts |
| `tree-file.svelte` | File with icon and name |
| `tree-folder.svelte` | Interactable folder with icon and name |
| `tree-context.svelte.ts` | Holds context for `tree.svelte` and `tree-folder.svelte` to determine open, interaction, and level states |
| `index.ts` | Barrel exports |