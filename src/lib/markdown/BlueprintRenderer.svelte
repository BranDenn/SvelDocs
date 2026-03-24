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

	type EstreeNode = {
		type?: string;
		value?: unknown;
		name?: string;
		operator?: string;
		argument?: EstreeNode;
		expressions?: EstreeNode[];
		quasis?: Array<{ value?: { cooked?: string } }>;
		properties?: Array<{
			type?: string;
			key?: EstreeNode;
			value?: EstreeNode;
			computed?: boolean;
			kind?: string;
		}>;
		elements?: Array<EstreeNode | null>;
		body?: Array<{ type?: string; expression?: EstreeNode }>;
	};

	type MdxAttributeValueExpression = {
		type?: string;
		value?: string;
		data?: {
			estree?: EstreeNode;
		};
	};

	const UNRESOLVED_MDX_EXPRESSION = Symbol('UNRESOLVED_MDX_EXPRESSION');

	function isRenderableComponent(value: unknown): value is Component<any> {
		return typeof value === 'function';
	}

	function getResolvedComponentCandidate(key: string): unknown {
		const direct = resolvedComponents[key];
		if (direct !== undefined) return direct;

		if (!key.includes('.')) return undefined;

		const [rootKey, ...pathParts] = key.split('.');
		if (!rootKey || pathParts.length === 0) return undefined;

		let current: unknown = resolvedComponents[rootKey];
		if (
			(typeof current !== 'object' || current === null) &&
			resolvedComponents[`$module:${rootKey}`]
		) {
			current = resolvedComponents[`$module:${rootKey}`];
		}

		for (const part of pathParts) {
			if (typeof current !== 'object' || current === null) return undefined;
			current = (current as Record<string, unknown>)[part];
		}

		return current;
	}

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

	function getAliasCandidates(key: string): string[] {
		return Array.from(new Set([key, ...(componentAliases[key] ?? [])]));
	}

	function resolveObjectKey(node: EstreeNode | undefined): string | null {
		if (!node) return null;

		if (node.type === 'Identifier' && typeof node.name === 'string') {
			return node.name;
		}

		if (
			node.type === 'Literal' &&
			(typeof node.value === 'string' || typeof node.value === 'number')
		) {
			return String(node.value);
		}

		return null;
	}

	function resolveEstreeExpression(node: EstreeNode | undefined): unknown {
		if (!node?.type) return UNRESOLVED_MDX_EXPRESSION;

		switch (node.type) {
			case 'Literal':
				return node.value;

			case 'Identifier':
				return node.name === 'undefined' ? undefined : UNRESOLVED_MDX_EXPRESSION;

			case 'UnaryExpression': {
				const resolvedArgument = resolveEstreeExpression(node.argument);
				if (resolvedArgument === UNRESOLVED_MDX_EXPRESSION) {
					return UNRESOLVED_MDX_EXPRESSION;
				}

				if (node.operator === '-' && typeof resolvedArgument === 'number') {
					return -resolvedArgument;
				}

				if (node.operator === '+' && typeof resolvedArgument === 'number') {
					return resolvedArgument;
				}

				if (node.operator === '!') {
					return !resolvedArgument;
				}

				return UNRESOLVED_MDX_EXPRESSION;
			}

			case 'TemplateLiteral': {
				if ((node.expressions?.length ?? 0) > 0) {
					return UNRESOLVED_MDX_EXPRESSION;
				}

				return (node.quasis ?? []).map((quasi) => quasi.value?.cooked ?? '').join('');
			}

			case 'ArrayExpression': {
				const values: unknown[] = [];

				for (const element of node.elements ?? []) {
					if (element === null) {
						values.push(undefined);
						continue;
					}

					const resolvedElement = resolveEstreeExpression(element);
					if (resolvedElement === UNRESOLVED_MDX_EXPRESSION) {
						return UNRESOLVED_MDX_EXPRESSION;
					}

					values.push(resolvedElement);
				}

				return values;
			}

			case 'ObjectExpression': {
				const result: Record<string, unknown> = {};

				for (const property of node.properties ?? []) {
					if (
						property?.type !== 'Property' ||
						property.computed ||
						property.kind === 'get' ||
						property.kind === 'set'
					) {
						return UNRESOLVED_MDX_EXPRESSION;
					}

					const key = resolveObjectKey(property.key);
					if (!key) return UNRESOLVED_MDX_EXPRESSION;

					const resolvedValue = resolveEstreeExpression(property.value);
					if (resolvedValue === UNRESOLVED_MDX_EXPRESSION) {
						return UNRESOLVED_MDX_EXPRESSION;
					}

					result[key] = resolvedValue;
				}

				return result;
			}

			default:
				return UNRESOLVED_MDX_EXPRESSION;
		}
	}

	function resolveMdxAttributeValue(value: unknown): unknown {
		if (!value || typeof value !== 'object') return value;

		const expressionValue = value as MdxAttributeValueExpression;
		if (expressionValue.type !== 'mdxJsxAttributeValueExpression') {
			return value;
		}

		const expressionStatement = expressionValue.data?.estree?.body?.[0];
		const resolvedExpression = resolveEstreeExpression(expressionStatement?.expression);

		if (resolvedExpression !== UNRESOLVED_MDX_EXPRESSION) {
			return resolvedExpression;
		}

		return expressionValue.value;
	}

	function getMdxProps(attrs: AstNode['attributes'] = []) {
		return attrs.reduce<Record<string, unknown>>((acc, attr) => {
			if (!attr?.name) return acc;
			acc[attr.name] = attr.value == null ? true : resolveMdxAttributeValue(attr.value);
			return acc;
		}, {});
	}

	function toResolvedRenderer(renderResult: unknown): ResolvedRenderer | null {
		if (!renderResult) return null;

		if (typeof renderResult === 'object' && 'component' in renderResult) {
			const component = (renderResult as { component?: unknown }).component;
			if (!isRenderableComponent(component)) return null;

			return {
				component,
				props: (renderResult as { props?: Record<string, unknown> }).props ?? {},
				inheritNodeProps: (renderResult as { inheritNodeProps?: boolean }).inheritNodeProps ?? true
			};
		}

		if (!isRenderableComponent(renderResult)) return null;

		return {
			component: renderResult,
			props: {},
			inheritNodeProps: true
		};
	}

	function getMappedRenderer(node: AstNode, key: string): ResolvedRenderer | null {
		for (const candidate of getAliasCandidates(key)) {
			const resolvedCandidate = getResolvedComponentCandidate(candidate);
			const resolvedRenderer = toResolvedRenderer(resolvedCandidate);
			if (resolvedRenderer) {
				return resolvedRenderer;
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
