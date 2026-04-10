<script lang="ts">
	import Link from '$lib/components/ui/link/link.svelte';
	import SEO from '$components/seo';
</script>

<SEO title="Home" />

<div class="grid grow content-center justify-items-center gap-2 p-4">
	<h1 class="text-center text-2xl">Welcome to <span class="text-accent">SvelDocs</span>.</h1>
	<Link
		class="hover:bg-primary hover:text-foreground text-muted-foreground hover:border-accent rounded border px-2 py-1 font-medium transition-colors"
		href="/docs"
		>View Docs
	</Link>
</div>
