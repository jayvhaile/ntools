export class Tree<T> {

	constructor(
		readonly node: T,
		readonly children: Tree<T>[]
	) {

	}

	traverse(onEach: (item: T) => void) {
		onEach(this.node)
		this.children.forEach(it => it.traverse(onEach))
	}

	async asyncDeepTraverse(onEach: (item: T) => Promise<void>) {
		await onEach(this.node)

		for (const child of this.children) {
			await child.asyncDeepTraverse(onEach)
		}
	}

	async asyncShallowTraverse(onEach: (item: T) => Promise<void>) {

		for (const child of this.children) {
			await onEach(this.node)
		}
	}
}
