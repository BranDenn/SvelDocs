<script lang="ts">
    import FileIcon from "@lucide/svelte/icons/file";
    import { getIndex } from './tree-context.svelte';
  
    let { name } = $props();
  </script>
  
  <button
    class="flex w-full items-center py-1.5 hover:bg-accent transition-colors text-left"
    style="padding-left: {(getIndex() * 1)}rem"
  >
    <FileIcon />
    {name}
  </button>