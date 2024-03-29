import {createHash} from 'crypto';
import {promises as fsPromises} from 'fs';
import {join, relative} from 'path';
import {NodeProject} from "../models/node-project.js";

const {readdir, readFile, stat} = fsPromises;


export async function hasProjectFiles(project: NodeProject): Promise<string> {
	return await hashDirectory(project.path, ['node_modules', 'dist', 'out']);
}

async function hashDirectory(directory: string, ignoredDirs: string[], baseDirectory: string = directory): Promise<string> {
	let items = await readdir(directory);
	let hashes: string[] = [];

	for (let item of items) {
		let fullPath = join(directory, item);

		if (shouldIgnorePath(fullPath, ignoredDirs)) {
			continue; // Skip ignored paths
		}

		let stats = await stat(fullPath);

		if (stats.isDirectory()) {
			let dirHash = await hashDirectory(fullPath, ignoredDirs, baseDirectory,);
			hashes.push(dirHash);
		} else {
			// console.log(shouldIgnorePath(fullPath,ignoredDirs),`Hashing ${fullPath}`)
			let content = await readFile(fullPath);
			let fileHash = createHash('sha256').update(content).digest('hex');
			hashes.push(fileHash);
		}
	}

	return createHash('sha256').update(hashes.sort().join('')).digest('hex');
}


function shouldIgnorePath(path: string, ignoredDirs: string[]): boolean {
	return ignoredDirs.some(dir => path.includes(`${dir}`));
}
