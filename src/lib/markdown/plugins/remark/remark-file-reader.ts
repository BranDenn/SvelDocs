import fs from 'node:fs';
import path from 'node:path';
// Note: avoid depending on unified's Plugin generic here to keep compatibility
import type { Root, Code } from 'mdast';
import type { Node, Parent } from 'unist';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

type AttrMap = Record<string, unknown>;

/**
 * Remark plugin that replaces a <FileReader file="..." /> MDX/HTML tag
 * with a fenced `code` node containing the referenced file's contents.
 */
const remarkFileReader = function (_options?: unknown) {
	function isObject(v: unknown): v is Record<string, unknown> {
		return typeof v === 'object' && v !== null;
	}

	function parseMdxAttributes(attributes: unknown[] | undefined): AttrMap {
		const out: AttrMap = {};
		if (!Array.isArray(attributes)) return out;

		for (const raw of attributes) {
			if (!isObject(raw)) continue;
			const type = String((raw as any).type ?? '');

			if (type === 'mdxJsxAttribute') {
				const name = String((raw as any).name ?? '');
				const val = (raw as any).value;

				if (val === undefined || val === null) {
					out[name] = true;
					continue;
				}

				if (typeof val === 'string') {
					out[name] = val;
					continue;
				}

				if (Array.isArray(val)) {
					out[name] = val
						.map((c) =>
							isObject(c) && typeof (c as any).value === 'string' ? (c as any).value : ''
						)
						.join('');
					continue;
				}

				if (isObject(val)) {
					const inner = (val as any).value ?? String(val);
					if (inner === 'true') out[name] = true;
					else if (inner === 'false') out[name] = false;
					else out[name] = inner;
					continue;
				}
			}

			if (type === 'mdxJsxExpressionAttribute') {
				const name = String((raw as any).name ?? '');
				const inner = (raw as any).value;
				const val = isObject(inner) ? (inner.value ?? inner) : inner;
				if (val === 'true') out[name] = true;
				else if (val === 'false') out[name] = false;
				else out[name] = val ?? '';
			}
		}

		return out;
	}

	function parseHtmlAttributes(value: string): AttrMap {
		const out: AttrMap = {};
		const m = value.match(/<FileReader\s*([^>]*)\/?>(?:<\/FileReader>)?/i);
		if (!m) return out;
		const attrs = m[1] ?? '';
		const re = /([A-Za-z0-9_:-]+)(?:\s*=\s*(?:"([^\"]*)"|'([^']*)'|([^\s"'>/]+)))?/g;
		let mm: RegExpExecArray | null;
		while ((mm = re.exec(attrs))) {
			const name = mm[1];
			const val = mm[2] ?? mm[3] ?? mm[4];
			out[name] = val === undefined ? true : val;
		}

		return out;
	}

	function resolveFile(fileRef: string): string | null {
		if (!fileRef) return null;

		try {
			// If absolute, use directly
			if (path.isAbsolute(fileRef)) {
				return fs.existsSync(fileRef) ? fileRef : null;
			}

			// Treat non-absolute paths as repo-root relative (e.g. "src/app.css")
			const repoResolved = path.resolve(process.cwd(), fileRef);
			return fs.existsSync(repoResolved) ? repoResolved : null;
		} catch (err) {
			// avoid throwing in the transformer — report and continue
			// eslint-disable-next-line no-console
			console.error('remark-file-reader.resolveFile error', err);
			return null;
		}
	}

	function trimTrailingBlankLines(content: string): string {
		// Normalize CRLF to LF
		let s = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
		// Remove all trailing blank lines and trailing whitespace on those lines
		s = s.replace(/(\n\s*)+$/g, '');
		return s;
	}

	function buildMeta(attrs: AttrMap, fileRef: string): string | undefined {
		const parts: string[] = [];

		const highlight = attrs.highlight ?? '';
		const h = String(highlight ?? '').trim();
		if (h) parts.push(h.startsWith('{') && h.endsWith('}') ? h : `{${h}}`);

		const show = attrs.showLineNumbers ?? attrs.showlineNumbers ?? attrs.showLines ?? attrs.show;
		if (show === true || String(show) === 'true' || show === '') parts.push('showLineNumbers');

		// Default the title to the full fileRef the user provided (not just the basename).
		const rawTitle = attrs.title ?? fileRef;
		const titleStr = String(rawTitle ?? '').trim() || String(fileRef);
		if (titleStr) parts.push(`title="${titleStr.replace(/"/g, '\\"')}"`);

		const caption = attrs.caption ?? '';
		if (caption) parts.push(`caption="${String(caption).replace(/"/g, '\\"')}"`);

		return parts.length ? parts.join(' ') : undefined;
	}

	return function transformer(tree: Root, file?: VFile) {
		// Handle MDX JSX flow elements
		visit(
			tree,
			'mdxJsxFlowElement' as any,
			(node: any, index?: number | null, parent?: Parent | null) => {
				if (!parent || typeof index !== 'number' || !Array.isArray(parent.children)) return;
				const name = String(node.name ?? '');
				if (name !== 'FileReader') return;

				const attrs = parseMdxAttributes(node.attributes as unknown[] | undefined);
				const fileRef = String(attrs.file ?? '').trim();
				if (!fileRef) {
					if (file && typeof (file as any).message === 'function')
						(file as any).message("<FileReader> missing 'file' attribute");
					return;
				}

				const resolved = resolveFile(fileRef);
				if (!resolved) {
					if (file && typeof (file as any).message === 'function')
						(file as any).message(`FileReader: file not found or not absolute: ${fileRef}`);
					return;
				}

				let content = '';
				try {
					content = trimTrailingBlankLines(fs.readFileSync(resolved, 'utf8'));
				} catch (err) {
					if (file && typeof (file as any).message === 'function')
						(file as any).message(
							`FileReader: failed to read ${resolved}: ${String((err as Error).message ?? err)}`
						);
					return;
				}

				const ext = path.extname(fileRef).replace(/^\./, '') || undefined;
				const meta = buildMeta(attrs, fileRef);
				const codeNode: Code = { type: 'code', lang: ext, meta, value: content } as Code;
				parent.children.splice(index, 1, codeNode as unknown as Node);
				return index + 1;
			}
		);

		// Handle MDX JSX text elements (inline)
		visit(
			tree,
			'mdxJsxTextElement' as any,
			(node: any, index?: number | null, parent?: Parent | null) => {
				if (!parent || typeof index !== 'number' || !Array.isArray(parent.children)) return;
				const name = String(node.name ?? '');
				if (name !== 'FileReader') return;

				const attrs = parseMdxAttributes(node.attributes as unknown[] | undefined);
				const fileRef = String(attrs.file ?? '').trim();
				if (!fileRef) {
					if (file && typeof (file as any).message === 'function')
						(file as any).message("<FileReader> missing 'file' attribute");
					return;
				}

				const resolved = resolveFile(fileRef);
				if (!resolved) {
					if (file && typeof (file as any).message === 'function')
						(file as any).message(`FileReader: file not found or not absolute: ${fileRef}`);
					return;
				}

				let content = '';
				try {
					content = trimTrailingBlankLines(fs.readFileSync(resolved, 'utf8'));
				} catch (err) {
					if (file && typeof (file as any).message === 'function')
						(file as any).message(
							`FileReader: failed to read ${resolved}: ${String((err as Error).message ?? err)}`
						);
					return;
				}

				const ext = path.extname(fileRef).replace(/^\./, '') || undefined;
				const meta = buildMeta(attrs, fileRef);
				const codeNode: Code = { type: 'code', lang: ext, meta, value: content } as Code;
				parent.children.splice(index, 1, codeNode as unknown as Node);
				return index + 1;
			}
		);

		// Handle raw HTML nodes
		visit(tree, 'html' as any, (node: any, index?: number | null, parent?: Parent | null) => {
			if (!parent || typeof index !== 'number' || !Array.isArray(parent.children)) return;
			const html = String(node.value ?? '');
			if (!/<FileReader\b/i.test(html)) return;

			const attrs = parseHtmlAttributes(html);
			const fileRef = String(attrs.file ?? '').trim();
			if (!fileRef) {
				if (file && typeof (file as any).message === 'function')
					(file as any).message("<FileReader> missing 'file' attribute");
				return;
			}

			const resolved = resolveFile(fileRef);
			if (!resolved) {
				if (file && typeof (file as any).message === 'function')
					(file as any).message(`FileReader: file not found: ${fileRef}`);
				return;
			}

			let content = '';
			try {
				content = trimTrailingBlankLines(fs.readFileSync(resolved, 'utf8'));
			} catch (err) {
				if (file && typeof (file as any).message === 'function')
					(file as any).message(
						`FileReader: failed to read ${resolved}: ${String((err as Error).message ?? err)}`
					);
				return;
			}

			const ext = path.extname(fileRef).replace(/^\./, '') || undefined;
			const meta = buildMeta(attrs, fileRef);
			const codeNode: Code = { type: 'code', lang: ext, meta, value: content } as Code;
			parent.children.splice(index, 1, codeNode as unknown as Node);
			return index + 1;
		});
	};
};

export default remarkFileReader;
