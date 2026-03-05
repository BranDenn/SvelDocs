<script lang="ts" module>
	import * as markdownComponents from '$lib/markdown-config';

	export const componentMap: Record<string, unknown> = {
		...markdownComponents
	};
</script>

<script lang="ts">
	import BlueprintRenderer from './BlueprintRenderer.svelte';

	type AstNode = {
		type: string;
		value?: string;
		tagName?: string;
		name?: string;
		properties?: Record<string, unknown>;
		attributes?: Array<{ name?: string; value?: unknown }>;
		children?: AstNode[];
	};

	let { node }: { node: AstNode } = $props();

	function getMdxProps(attrs: AstNode['attributes'] = []) {
		return attrs.reduce<Record<string, unknown>>((acc, attr) => {
			if (!attr?.name) return acc;
			acc[attr.name] = attr.value ?? true;
			return acc;
		}, {});
	}
</script>

{#if node.type === 'text'}
	{node.value}
{:else if node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement'}
	{@const mdxComponent = node.name ? componentMap[node.name] : null}
	{#if mdxComponent}
		{@const MdxComponent = mdxComponent}
		<MdxComponent {...getMdxProps(node.attributes)}>
			{#each node.children ?? [] as child, i (`${node.name ?? 'mdx'}-${i}`)}
				<BlueprintRenderer node={child} />
			{/each}
		</MdxComponent>
	{/if}
{:else if node.type === 'element'}
	{@const elementName = node.tagName ?? 'div'}
	{@const mappedComponent = componentMap[elementName]}
	{#if mappedComponent}
		{@const ElementComponent = mappedComponent}
		<ElementComponent {...(node.properties ?? {})}>
			{#each node.children ?? [] as child, i (`${elementName}-${i}`)}
				<BlueprintRenderer node={child} />
			{/each}
		</ElementComponent>
	{:else}
		<svelte:element this={elementName} {...(node.properties ?? {})}>
			{#each node.children ?? [] as child, i (`${elementName}-${i}`)}
				<BlueprintRenderer node={child} />
			{/each}
		</svelte:element>
	{/if}
{/if}
