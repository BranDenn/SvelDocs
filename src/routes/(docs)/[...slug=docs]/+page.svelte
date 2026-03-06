<script lang="ts">
	import './docs.css';
	import SEO from '$components/seo';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { page } from '$app/state';
	import { Link } from '$ui/link';
	import BlueprintRenderer from '$lib/markdown/BlueprintRenderer.svelte';
	import { getDocNavigationContext } from '$lib/doc-navigation-context.svelte';

	type PageData = {
		ast: {
			children?: Array<Record<string, unknown>>;
		};
		metadata: Record<string, unknown>;
		slug: string;
		title: string;
		access: 'public' | 'private';
	};

	let { data }: { data: PageData } = $props();

	const docNavigation = getDocNavigationContext();
</script>

<SEO
	title={String(data.metadata.title ?? data.title)}
	description={String(data.metadata.description ?? '')}
	type="article"
/>

<header class="flex flex-col items-start gap-2">
	{#if docNavigation.currentGroup}
		<span class="text-accent text-sm font-medium">{docNavigation.currentGroup.title}</span>
	{/if}
	<h1 class="text-3xl font-extrabold sm:text-4xl">{data.title}</h1>
	{#if data.metadata.description}
		<p class="text-muted-foreground sm:text-lg">{data.metadata.description}</p>
	{/if}
	<div
		class="bg-secondary flex items-center divide-x overflow-hidden rounded-lg border text-xs shadow"
	>
		<div class="hover:bg-primary flex items-center gap-2 px-2 py-1.5 transition-[background-color]">
			<CopyIcon class="size-4 shrink-0" />
			Copy Page
		</div>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="hover:bg-primary data-[state=open]:bg-primary group p-1.5 transition-[background-color]"
			>
				<ChevronDownIcon
					class="size-4 shrink-0 transition-[translate] group-data-[state=open]:translate-y-0.25"
				/>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="[&>[data-slot=dropdown-menu-item]>svg]:size-7.5 [&>[data-slot=dropdown-menu-item]>svg]:rounded-md [&>[data-slot=dropdown-menu-item]>svg]:border [&>[data-slot=dropdown-menu-item]>svg]:p-1.5"
			>
				<DropdownMenu.Item>
					<CopyIcon class="size-4 shrink-0" />
					<div class="flex flex-col">
						Copy Page
						<span class="text-muted-foreground text-xs">Copy page as Markdown for LLMs</span>
					</div>
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					{#snippet child({ props })}
						<Link href={page.url.pathname + '.md'} target="_blank" {...props}>
							<svg
								width="18"
								height="18"
								viewBox="0 0 18 18"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path
									d="M15.25 3.75H2.75C1.64543 3.75 0.75 4.64543 0.75 5.75V12.25C0.75 13.3546 1.64543 14.25 2.75 14.25H15.25C16.3546 14.25 17.25 13.3546 17.25 12.25V5.75C17.25 4.64543 16.3546 3.75 15.25 3.75Z"
								></path>
								<path d="M8.75 11.25V6.75H8.356L6.25 9.5L4.144 6.75H3.75V11.25"></path>
								<path d="M11.5 9.5L13.25 11.25L15 9.5"></path>
								<path d="M13.25 11.25V6.75"></path>
							</svg>
							<div class="flex flex-col">
								<div class="flex items-center gap-1">
									View as Markdown
									<ArrowUpRightIcon class="text-muted-foreground size-3 shrink-0" />
								</div>
								<span class="text-muted-foreground text-xs">View this page as plain text</span>
							</div>
						</Link>
					{/snippet}
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					{#snippet child({ props })}
						<Link href={page.url.pathname + '.md'} target="_blank" {...props}>
							<svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<title>OpenAI</title>
								<path
									d="M21.55 10.004a5.416 5.416 0 00-.478-4.501c-1.217-2.09-3.662-3.166-6.05-2.66A5.59 5.59 0 0010.831 1C8.39.995 6.224 2.546 5.473 4.838A5.553 5.553 0 001.76 7.496a5.487 5.487 0 00.691 6.5 5.416 5.416 0 00.477 4.502c1.217 2.09 3.662 3.165 6.05 2.66A5.586 5.586 0 0013.168 23c2.443.006 4.61-1.546 5.361-3.84a5.553 5.553 0 003.715-2.66 5.488 5.488 0 00-.693-6.497v.001zm-8.381 11.558a4.199 4.199 0 01-2.675-.954c.034-.018.093-.05.132-.074l4.44-2.53a.71.71 0 00.364-.623v-6.176l1.877 1.069c.02.01.033.029.036.05v5.115c-.003 2.274-1.87 4.118-4.174 4.123zM4.192 17.78a4.059 4.059 0 01-.498-2.763c.032.02.09.055.131.078l4.44 2.53c.225.13.504.13.73 0l5.42-3.088v2.138a.068.068 0 01-.027.057L9.9 19.288c-1.999 1.136-4.552.46-5.707-1.51h-.001zM3.023 8.216A4.15 4.15 0 015.198 6.41l-.002.151v5.06a.711.711 0 00.364.624l5.42 3.087-1.876 1.07a.067.067 0 01-.063.005l-4.489-2.559c-1.995-1.14-2.679-3.658-1.53-5.63h.001zm15.417 3.54l-5.42-3.088L14.896 7.6a.067.067 0 01.063-.006l4.489 2.557c1.998 1.14 2.683 3.662 1.529 5.633a4.163 4.163 0 01-2.174 1.807V12.38a.71.71 0 00-.363-.623zm1.867-2.773a6.04 6.04 0 00-.132-.078l-4.44-2.53a.731.731 0 00-.729 0l-5.42 3.088V7.325a.068.068 0 01.027-.057L14.1 4.713c2-1.137 4.555-.46 5.707 1.513.487.833.664 1.809.499 2.757h.001zm-11.741 3.81l-1.877-1.068a.065.065 0 01-.036-.051V6.559c.001-2.277 1.873-4.122 4.181-4.12.976 0 1.92.338 2.671.954-.034.018-.092.05-.131.073l-4.44 2.53a.71.71 0 00-.365.623l-.003 6.173v.002zm1.02-2.168L12 9.25l2.414 1.375v2.75L12 14.75l-2.415-1.375v-2.75z"
								></path>
							</svg>
							<div class="flex flex-col">
								<div class="flex items-center gap-1">
									Open in ChatGPT
									<ArrowUpRightIcon class="text-muted-foreground size-3 shrink-0" />
								</div>
								<span class="text-muted-foreground text-xs">Ask questions about this page</span>
							</div>
						</Link>
					{/snippet}
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>

<hr class="border-border my-4" />

<article class="prose">
	{#each data.ast.children ?? [] as node, i (`node-${i}`)}
		<BlueprintRenderer {node} />
	{/each}
</article>
