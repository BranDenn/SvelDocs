declare module 'virtual:icon-manifest' {
	export const iconLoaders: Record<string, () => Promise<any>>;
	export default iconLoaders;
}
