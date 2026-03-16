<script lang="ts">
	import * as Sidebar from '$ui/sidebar';
	import { cn } from '$utils';
	import * as TOC from '$ui/table-of-contents';
	import Button from '$ui/button';

	import CircleArrowUpIcon from '@lucide/svelte/icons/circle-arrow-up';

	const toc = TOC.getTOCContext();
</script>

<Sidebar.Root
	class={cn(
		'-mr-64 overflow-y-hidden opacity-0 transition-[margin,opacity] duration-300 xl:mr-0 xl:overflow-y-auto xl:opacity-100',
		'top-docs-header h-[calc(100dvh-var(--spacing-docs-header))]'
	)}
>
	<Sidebar.Container>
		<Sidebar.Header />
		<Sidebar.Content>
			{#if toc.tocEntries.length > 0}
				<TOC.Nav>
					<TOC.Label />
					<TOC.List />
				</TOC.Nav>
			{/if}
		</Sidebar.Content>
		<Sidebar.Footer>
			<Button
				variant="ghost"
				class="justify-start"
				onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			>
				<CircleArrowUpIcon />
				<span>Back to top</span>
			</Button>
		</Sidebar.Footer>
	</Sidebar.Container>
</Sidebar.Root>
