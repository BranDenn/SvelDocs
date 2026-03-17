declare module 'virtual:doc-search-json' {
	import type { DocsManifestData } from '../../plugins/processed-docs/types';

	const searchJsonData: DocsManifestData;
	export default searchJsonData;
}
