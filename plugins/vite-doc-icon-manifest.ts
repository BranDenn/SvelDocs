import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import type { PluginOption } from 'vite';

const VIRTUAL_DOC_ICON_MANIFEST_ID = 'virtual:doc-icon-manifest';
const RESOLVED_VIRTUAL_DOC_ICON_MANIFEST_ID = '\0virtual:doc-icon-manifest';

function escapeString(value: string): string {
	const escapedBackslash = String.raw`\\`;
	const escapedSingleQuote = String.raw`\'`;
	return value.replaceAll('\\', escapedBackslash).replaceAll("'", escapedSingleQuote);
}

function extractNavigationIcons(source: string): string[] {
	const matches = source.matchAll(/\bicon\s*:\s*['"]([^'"\n\r]+)['"]/g);
	const icons = new Set<string>();

	for (const match of matches) {
		const iconName = match[1]?.trim();
		if (iconName) {
			icons.add(iconName);
		}
	}

	return [...icons].sort((a, b) => a.localeCompare(b));
}

function getAvailableLucideIcons(): Set<string> {
	try {
		const req = createRequire(import.meta.url);
		const packageJsonPath = req.resolve('@lucide/svelte/package.json');
		const packageRoot = path.dirname(packageJsonPath);
		const iconsDir = path.join(packageRoot, 'icons');

		if (!fs.existsSync(iconsDir)) {
			console.warn('[doc-icon-manifest] Could not find @lucide/svelte/icons directory.');
			return new Set();
		}

		const iconFiles = fs.readdirSync(iconsDir);
		const icons = iconFiles
			.filter((file) => /\.(js|mjs|cjs|ts|svelte)$/.test(file))
			.map((file) => file.replace(/\.(js|mjs|cjs|ts|svelte)$/, ''))
			.filter((name) => name !== 'index');

		return new Set(icons);
	} catch {
		console.warn('[doc-icon-manifest] Failed to resolve @lucide/svelte package.');
		return new Set();
	}
}

function generateModuleSource(navigationFilePath: string): string {
	if (!fs.existsSync(navigationFilePath)) {
		return 'export default {};';
	}

	const source = fs.readFileSync(navigationFilePath, 'utf-8');
	const navigationIcons = extractNavigationIcons(source);
	const availableLucideIcons = getAvailableLucideIcons();
	const hasLucideInventory = availableLucideIcons.size > 0;

	const lines: string[] = [];
	lines.push('const manifest = {};');
	let importIndex = 0;

	for (const iconName of navigationIcons) {
		if (hasLucideInventory && !availableLucideIcons.has(iconName)) {
			lines.push(
				`console.warn('[doc-icon-manifest] Unknown Lucide icon: ${escapeString(iconName)}');`
			);
			lines.push(`manifest['${escapeString(iconName)}'] = undefined;`);
			continue;
		}

		const importName = `icon_${importIndex++}`;
		lines.push(`import ${importName} from '@lucide/svelte/icons/${escapeString(iconName)}';`);
		lines.push(`manifest['${escapeString(iconName)}'] = ${importName};`);
	}

	lines.push('export default manifest;');
	return lines.join('\n');
}

export function docIconManifest(options: { navigationPath: string }): PluginOption {
	const absoluteNavigationPath = path.resolve(process.cwd(), options.navigationPath);

	return {
		name: 'vite-plugin-doc-icon-manifest',
		resolveId(id) {
			if (id === VIRTUAL_DOC_ICON_MANIFEST_ID) {
				return RESOLVED_VIRTUAL_DOC_ICON_MANIFEST_ID;
			}

			return null;
		},
		load(id) {
			if (id !== RESOLVED_VIRTUAL_DOC_ICON_MANIFEST_ID) {
				return null;
			}

			return generateModuleSource(absoluteNavigationPath);
		},
		handleHotUpdate(ctx) {
			if (path.resolve(ctx.file) !== absoluteNavigationPath) {
				return;
			}

			const virtualModule = ctx.server.moduleGraph.getModuleById(
				RESOLVED_VIRTUAL_DOC_ICON_MANIFEST_ID
			);
			if (virtualModule) {
				ctx.server.moduleGraph.invalidateModule(virtualModule);
			}
		}
	};
}
