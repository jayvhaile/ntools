import meow from 'meow';
import {findNodeProjects} from "./tools/find-node-projects.js";
import {cleanProject} from "./tools/clean-project.js";
import {buildProjectDependencyGraph} from "./tools/build-project-dependency-graph.js";
import pkg from '@dagrejs/graphlib';
import {buildProject} from "./tools/build-project.js";
import {hasProjectFiles} from "./tools/hash-project-files.js";
import {NodeProject} from "./models/node-project.js";
import {JSONFilePreset} from 'lowdb/node'

const {alg} = pkg;


async function loadProjects(root: string, excludedProjects: string[]): Promise<NodeProject[]> {
	return await findNodeProjects('/home/jv/Documents/Projects/fortunato-online')
		.then(p => p.filter(it => !excludedProjects.includes(it.name)))
}

function indexProjects(projects: NodeProject[]): Map<string, NodeProject> {
	const map = new Map<string, NodeProject>()
	projects.forEach(it => map.set(it.name, it))
	return map
}

function buildHashIndex(projects: NodeProject[]): Promise<Map<string, string>> {
	return Promise.all(projects.map(
		it => hasProjectFiles(it).then(hash => [it.name, hash] as [string, string])
	)).then(it => new Map(it))
}

type DBSchema = Record<string, {
	hash: string
}>

function findAllDependants(graph: pkg.Graph, node: string): Set<string> {
	let dependants = new Set<string>();

	function visit(n: string) {
		// Get all nodes that n depends on (inbound edges)
		const predecessors = graph.successors(n);
		if (predecessors) {
			for (const pred of predecessors) {
				if (!dependants.has(pred)) {
					dependants.add(pred);
					visit(pred); // Recurse to find indirect dependants
				}
			}
		}
	}

	visit(node); // Start the search from the specified node
	return dependants;
}


(async () => {
	const root = '';
	const db = await JSONFilePreset<DBSchema>(`${root}/db.json`, {})

	await db.read()



	const projects = await loadProjects(
		root,
		[],
	)


	const index = indexProjects(projects);

	const hashIndex = await buildHashIndex(projects);


	const dependencyGraph = buildProjectDependencyGraph(projects);


	let ordered = alg.topsort(dependencyGraph)

	const findFirstChanged = ordered.find(it => {
		const previousHash= db.data[it]?.hash;
		const currentHash=hashIndex.get(it);

		return previousHash!=currentHash
	})

	console.log("First changed", findFirstChanged)


	const indexOfFirstChanged = ordered.indexOf(findFirstChanged!)

	const toUpdate = ordered.slice(indexOfFirstChanged)


	for (const projectName of toUpdate) {
		console.log(`Building ${projectName}...`)
		const project = projects.find(it => it.name == projectName)!;
		await buildProject(project)
		await db.update(it => {
			it = it ?? {};
			it[project.name] = {hash: hashIndex.get(project.name)!}
		})
	}


})()
