import { defineMDSveXConfig, escapeSvelte } from 'mdsvex';
import { createHighlighter } from 'shiki';
import remarkGfm from "remark-gfm";

const lightTheme = 'github-light';
const darkTheme = 'github-dark';

const highlighter = await createHighlighter({
	themes: [lightTheme, darkTheme],
	langs: ['typescript', 'javascript', 'css', 'c#', 'php']
});

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = defineMDSveXConfig({
	extensions: ['.md'],
	remarkPlugins: [remarkGfm],
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const html = escapeSvelte(
				highlighter.codeToHtml(code, {
					lang,
					themes: {
						light: lightTheme,
						dark: darkTheme
					}
				})
			);
			return `{@html \`${html}\` }`;
		}
	}
});

export default mdsvexOptions;
