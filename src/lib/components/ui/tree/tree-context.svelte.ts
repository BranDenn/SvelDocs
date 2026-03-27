import { createContext } from 'svelte';

/**
 * Class used to auto increment step number.
 * A $state.raw array of ids was the only way to preserve the numbers with vite's hot module reload
 */
export class TreeContext {
    #levels: string[] = $state.raw([])

	registerLevel(id: string) {
		this.#levels.push(id)
	}

	removeLevel(id: string) {
		this.#levels = this.#levels.filter(step => step !== id)
	}

	getLevel(id: string) {
		return this.#levels.indexOf(id)
	}
}

const [getTree, set] = createContext<TreeContext>();

export { getTree };

export function setTree(start: () => number) {
    return set(new TreeContext(start));
}

export function getIndex() {
    const ctx = getTree();
    return ctx.incremented();
}