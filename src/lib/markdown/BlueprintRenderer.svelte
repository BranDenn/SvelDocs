<script lang="ts">
	import BlueprintRenderer from './BlueprintRenderer.svelte';
	import type { Component } from 'svelte';
	import astNodeRenderers from './components';
	import { isNodeResolver, type AstNodeRendererResult, type AstNode } from './components';

	const componentMap = {
		...astNodeRenderers
	};

	// Void elements that cannot have children
	const VOID_ELEMENTS = new Set([
		'area',
		'base',
		'br',
		'col',
		'embed',
		'hr',
		'img',
		'input',
		'keygen',
		'link',
		'meta',
		'param',
		'source',
		'track',
		'wbr'
	]);

	type ResolvedRenderer = {
		component: Component<any>;
		props: Record<string, unknown>;
		inheritNodeProps: boolean;
	};

	let {
		node,
		parentElement,
		componentAliases = {},
		resolvedComponents = {}
	}: {
		node: AstNode;
		parentElement?: string;
		componentAliases?: Record<string, string[]>;
		resolvedComponents?: Record<string, Component<any>>;
	} = $props();

	function getAliasCandidates(key: string): string[] {
		return Array.from(new Set([key, ...(componentAliases[key] ?? [])]));
	}

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
		for (const candidate of getAliasCandidates(key)) {
			const resolvedComponent = resolvedComponents[candidate];
			if (resolvedComponent) {
				return toResolvedRenderer(resolvedComponent);
			}

			const mapped = componentMap[candidate as keyof typeof componentMap];
			if (!mapped) continue;

			if (isNodeResolver(mapped)) {
				return toResolvedRenderer(mapped({ node, parentElement }));
			}

			return toResolvedRenderer(mapped);
		}

		return null;
	}
</script>

{#if node.type === 'text'}
	{node.value}
{:else if node.type?.startsWith('mdxJsx')}
	{@const mappedMdxRenderer = node.name ? getMappedRenderer(node, node.name) : null}
	{#if node.name === 'script'}
		<!-- Ignore MDX script blocks; import declarations cannot run from injected HTML script tags. -->
	{:else if mappedMdxRenderer}
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
	{@const mappedElementRenderer = getMappedRenderer(node, elementName)}
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
