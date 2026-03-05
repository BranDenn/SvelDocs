declare module 'virtual:doc-icon-manifest' {
	import type { Component } from 'svelte';
	import type { IconProps } from '@lucide/svelte';

	const manifest: Record<string, Component<IconProps, {}, ''> | undefined>;
	export default manifest;
}
