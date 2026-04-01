<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import siteConfig from '$lib/configuration/site.config';
	import Button from '$ui/button';
	import { getDocNavigationContext } from '$lib/doc-navigation-context.svelte';

	const docNavigation = getDocNavigationContext();
</script>

<footer class="flex flex-col gap-4 text-sm">
	<div class="grid gap-4 sm:grid-cols-2">
		{#if docNavigation.prevPage}
			{@const group = docNavigation.getGroup(docNavigation.prevPage.groupId)}
			<Button
				href={docNavigation.prevPage.href}
				class="bg-secondary hover:bg-primary group text-muted-foreground hover:text-accent flex items-center justify-center gap-2 rounded-lg border p-4 text-sm font-medium transition-[background-color]"
			>
				<ArrowLeft class="size-4 shrink-0 transition-[color,margin] group-hover:mr-1" />
				<span class="transition-[color]">{docNavigation.prevPage.title}</span>
				{#if group}
					<div class="bg-border hidden h-4 w-px lg:block"></div>
					<span class="text-muted-foreground hidden lg:block">{group.title}</span>
				{/if}
			</Button>
		{/if}
		{#if docNavigation.nextPage}
			{@const group = docNavigation.getGroup(docNavigation.nextPage.groupId)}
			<Button
				href={docNavigation.nextPage.href}
				class="bg-secondary hover:bg-primary group text-muted-foreground hover:text-accent flex items-center justify-center gap-2 rounded-lg border p-4 text-sm font-medium transition-[background-color] sm:col-2"
			>
				{#if group}
					<span class="text-muted-foreground hidden lg:block">{group.title}</span>
					<div class="bg-border hidden h-4 w-px lg:block"></div>
				{/if}
				<span class="transition-[color]">{docNavigation.nextPage.title}</span>
				<ArrowRight class="size-4 shrink-0 transition-[color,margin] group-hover:ml-1" />
			</Button>
		{/if}
	</div>
	<hr />
	<div class="text-muted-foreground flex flex-wrap items-center justify-between gap-2">
		<p>Copyright © {new Date().getFullYear()} {siteConfig.name}</p>
	</div>
</footer>
