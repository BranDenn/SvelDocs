<script lang="ts">
	import BlueprintRenderer from './BlueprintRenderer.svelte';
	import type { Component } from 'svelte';
	import astNodeRenderers from './components';
	import { isNodeResolver, type AstNodeRendererResult, type AstNode } from './components';

	const componentMap = {
		...astNodeRenderers
	};

	type ResolvedRenderer = {
		component: Component<any>;
		props: Record<string, unknown>;
		inheritNodeProps: boolean;
	};

	let { node }: { node: AstNode } = $props();

	function getMdxProps(attrs: AstNode['attributes'] = []) {
		return attrs.reduce<Record<string, unknown>>((acc, attr) => {
			if (!attr?.name) return acc;
			acc[attr.name] = attr.value ?? true;
			return acc;
		}, {});
	}

	function toResolvedRenderer(renderResult: AstNodeRendererResult): ResolvedRenderer | null {
		if (!renderResult) return null;

		if (typeof renderResult === 'object' && 'component' in renderResult) {
			return {
				component: renderResult.component,
				props: renderResult.props ?? {},
				inheritNodeProps: renderResult.inheritNodeProps ?? true
			};
		}

		return {
			component: renderResult,
			props: {},
			inheritNodeProps: true
		};
	}

	function getMappedRenderer(node: AstNode, key: string): ResolvedRenderer | null {
		const mapped = componentMap[key];
		if (!mapped) return null;

		if (isNodeResolver(mapped)) {
			return toResolvedRenderer(mapped(node));
		}

		return toResolvedRenderer(mapped);
	}
</script>

{#if node.type === 'text'}
	{node.value}
{:else if node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement'}
	{@const mappedMdxRenderer = node.name ? getMappedRenderer(node, node.name) : null}
	{#if mappedMdxRenderer}
		{@const MdxComponent = mappedMdxRenderer.component}
		{@const mdxProps = mappedMdxRenderer.inheritNodeProps ? getMdxProps(node.attributes) : {}}
		<MdxComponent {...mdxProps} {...mappedMdxRenderer.props}>
			{#each node.children ?? [] as child, i (`${node.name ?? 'mdx'}-${i}`)}
				<BlueprintRenderer node={child} />
			{/each}
		</MdxComponent>
	{/if}
{:else if node.type === 'element'}
	{@const elementName = node.tagName ?? 'div'}
	{@const mappedElementRenderer = getMappedRenderer(node, elementName)}
	{#if mappedElementRenderer}
		{@const ElementComponent = mappedElementRenderer.component}
		{@const elementProps = mappedElementRenderer.inheritNodeProps ? (node.properties ?? {}) : {}}
		<ElementComponent {...elementProps} {...mappedElementRenderer.props}>
			{#each node.children ?? [] as child, i (`${elementName}-${i}`)}
				<BlueprintRenderer node={child} />
			{/each}
		</ElementComponent>
	{:else}
		<svelte:element this={elementName} {...node.properties ?? {}}>
			{#each node.children ?? [] as child, i (`${elementName}-${i}`)}
				<BlueprintRenderer node={child} />
			{/each}
		</svelte:element>
	{/if}
{/if}
