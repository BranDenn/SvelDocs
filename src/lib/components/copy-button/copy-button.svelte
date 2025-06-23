<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
    import Check from '@lucide/svelte/icons/check';
	import type { ClassValue } from 'svelte/elements';
    import { cn } from '$lib';

    let { class: className, content, timeout = 3000 } : { class?: ClassValue, content: string, timeout?: number } = $props();

    let copied = $state(false);

    async function copyToClipboard() {
        if (copied) return;

        try {
            await navigator.clipboard.writeText(content)
            copied = true;
            setTimeout(() => copied = false, timeout);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }
</script>

<button 
class={cn(
    "p-1 border rounded bg-background transition-colors hover:bg-foreground text-secondary hover:text-primary", 
    className)}
    onclick={copyToClipboard}
    >
    {#if copied}
        <Check class="size-4" />
    {:else}
	    <Copy class="size-4"/>
    {/if}
</button>
