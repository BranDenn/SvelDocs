<script lang="ts">
	import BlueprintRenderer from './blueprint-renderer.svelte';
	import type { AstNode } from '../components';
	import { VOID_ELEMENTS, getMappedRenderer, getMdxProps } from './utils';

	let {
		node,
		parentElement,
		componentAliases = {},
		resolvedComponents = {}
	}: {
		node: AstNode;
		parentElement?: string;
		componentAliases?: Record<string, string[]>;
		resolvedComponents?: Record<string, unknown>;
	} = $props();
</script>

{#if node.type === 'text'}
	{node.value}
{:else if node.type?.startsWith('mdxJsx')}
	{@const mappedMdxRenderer = node.name
		? getMappedRenderer(node, node.name, {
				parentElement,
				componentAliases,
				resolvedComponents
			})
		: null}
	{#if mappedMdxRenderer}
		{@const MdxComponent = mappedMdxRenderer.component}
		{@const mdxProps = mappedMdxRenderer.inheritNodeProps ? getMdxProps(node.attributes) : {}}
		<MdxComponent {...mdxProps} {...mappedMdxRenderer.props}>
			{#each node.children ?? [] as child, i (`${node.name ?? 'mdx'}-${i}`)}
				<BlueprintRenderer
					node={child}
					parentElement={node.name}
					{componentAliases}
					{resolvedComponents}
				/>
			{/each}
		</MdxComponent>
	{:else if node.name}
		<svelte:element this={node.name} {...node.properties ?? {}}>
			{#each node.children ?? [] as child, i (`${node.name}-${i}`)}
				<BlueprintRenderer
					node={child}
					parentElement={node.name}
					{componentAliases}
					{resolvedComponents}
				/>
			{/each}
		</svelte:element>
	{/if}
{:else if node.type === 'element'}
	{@const elementName = node.tagName ?? 'div'}
	{@const mappedElementRenderer = getMappedRenderer(node, elementName, {
		parentElement,
		componentAliases,
		resolvedComponents
	})}
	{@const isVoidElement = VOID_ELEMENTS.has(elementName)}
	{#if mappedElementRenderer}
		{@const ElementComponent = mappedElementRenderer.component}
		{@const elementProps = mappedElementRenderer.inheritNodeProps ? (node.properties ?? {}) : {}}
		<ElementComponent {...elementProps} {...mappedElementRenderer.props}>
			{#each node.children ?? [] as child, i (`${elementName}-${i}`)}
				<BlueprintRenderer
					node={child}
					parentElement={elementName}
					{componentAliases}
					{resolvedComponents}
				/>
			{/each}
		</ElementComponent>
	{:else if isVoidElement}
		<svelte:element this={elementName} {...node.properties ?? {}} />
	{:else}
		<svelte:element this={elementName} {...node.properties ?? {}}>
			{#each node.children ?? [] as child, i (`${elementName}-${i}`)}
				<BlueprintRenderer
					node={child}
					parentElement={elementName}
					{componentAliases}
					{resolvedComponents}
				/>
			{/each}
		</svelte:element>
	{/if}
{/if}
