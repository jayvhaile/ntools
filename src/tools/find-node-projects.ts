import {scanFile} from "../utils/scan.js";
import {promises as fs} from 'fs';
import {NodeProject} from "../models/node-project.js";
import path from "path";

export async function findNodeProjects(projectRoot: string): Promise<NodeProject[]> {
	const packageJsonFiles = await scanFile(
		'package.json',
		projectRoot,
		['node_modules', '.git', 'dist', 'out'],
	);

	return Promise.all(packageJsonFiles.map<Promise<NodeProject>>(async p => {
			try {
				const content = await fs.readFile(p)
				const data = JSON.parse(content.toString())

				const deps = data.localDependencies || [];

				if (deps == null || typeof deps != 'object' || !Array.isArray(deps)) {
					console.log(typeof deps)
					console.log(deps)
					throw new Error(`Invalid localDependencies for ${p}`)
				}
				return {
					name: data.name,
					path: path.resolve(p, '..'),
					isLib: data.lib?.toString() == 'true',
					dependencies: deps,
				}
			} catch
				(e) {
				console.log(`failed for ${p}`)
				throw e;
			}
		}
	))
}
