import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import type { PluginOption } from 'vite';

const VIRTUAL_ICON_MANIFEST_ID = 'virtual:icon-manifest';
const RESOLVED_VIRTUAL_ICON_MANIFEST_ID = '\0virtual:icon-manifest';

type IconManifestOptions = {
	files: string[];
	iconPackage: string;
};

function escapeString(value: string): string {
	const escapedBackslash = String.raw`\\`;
	const escapedSingleQuote = String.raw`\'`;
	return value.replaceAll('\\', escapedBackslash).replaceAll("'", escapedSingleQuote);
}

function extractIcons(source: string): string[] {
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

function getAvailableIconsForPackage(iconPackage: string): Set<string> {
	try {
		const req = createRequire(import.meta.url);
		const packageEntrypointPath = req.resolve(iconPackage);
		const iconsDir = path.dirname(packageEntrypointPath);

		if (!fs.existsSync(iconsDir)) {
			console.warn(`[icon-manifest] Could not find icon directory for package: ${iconPackage}`);
			return new Set();
		}

		const iconFiles = fs.readdirSync(iconsDir);
		const icons = iconFiles
			.filter((file) => /\.(js|mjs|cjs)$/.test(file))
			.map((file) => file.replace(/\.(js|mjs|cjs)$/, ''))
			.filter((name) => name !== 'index');

		return new Set(icons);
	} catch (error) {
		console.warn(`[icon-manifest] Failed to resolve icon package: ${iconPackage}`, error);
		return new Set();
	}
}

function generateModuleSource(filePaths: string[], iconPackage: string): string {
	const sourceFiles = filePaths.filter((filePath) => fs.existsSync(filePath));

	if (sourceFiles.length === 0) {
		return 'export default {};';
	}

	const icons = new Set<string>();
	for (const filePath of sourceFiles) {
		const source = fs.readFileSync(filePath, 'utf-8');
		for (const iconName of extractIcons(source)) {
			icons.add(iconName);
		}
	}

	const availableIcons = getAvailableIconsForPackage(iconPackage);
	const hasIconInventory = availableIcons.size > 0;
	const lines: string[] = [];
	lines.push('const manifest = {};');
	let importIndex = 0;

	for (const iconName of [...icons].sort((a, b) => a.localeCompare(b))) {
		if (hasIconInventory && !availableIcons.has(iconName)) {
			lines.push(
				`console.warn('[icon-manifest] Unknown icon: ${escapeString(iconName)}. Checked package: ${escapeString(iconPackage)}');`,
				`manifest['${escapeString(iconName)}'] = undefined;`
			);
			continue;
		}

		const importName = `icon_${importIndex++}`;
		lines.push(
			`import ${importName} from '${escapeString(iconPackage)}/${escapeString(iconName)}';`,
			`manifest['${escapeString(iconName)}'] = ${importName};`
		);
	}

	lines.push('export default manifest;');
	return lines.join('\n');
}

export function iconManifest(options: IconManifestOptions): PluginOption {
	const absoluteFilePaths = options.files.map((filePath) => path.resolve(process.cwd(), filePath));
	const iconPackage = options.iconPackage.trim();
	const watchedFiles = new Set(absoluteFilePaths);

	return {
		name: 'vite-plugin-icon-manifest',
		resolveId(id) {
			if (id === VIRTUAL_ICON_MANIFEST_ID) {
				return RESOLVED_VIRTUAL_ICON_MANIFEST_ID;
			}

			return null;
		},
		load(id) {
			if (id !== RESOLVED_VIRTUAL_ICON_MANIFEST_ID) {
				return null;
			}

			return generateModuleSource(absoluteFilePaths, iconPackage);
		},
		handleHotUpdate(ctx) {
			if (!watchedFiles.has(path.resolve(ctx.file))) {
				return;
			}

			const virtualModule = ctx.server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ICON_MANIFEST_ID);
			if (virtualModule) {
				ctx.server.moduleGraph.invalidateModule(virtualModule);
			}
		}
	};
}