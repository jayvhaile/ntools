import { promises as fs } from 'fs';
import path from 'path';


export async function scanFile(fileName:string,root: string, excludeDirs: string[]): Promise<string[]> {
    async function scanDirectory(directory: string): Promise<string[]> {
        let deployJsonFiles: string[] = [];

        const entries = await fs.readdir(directory, { withFileTypes: true });
        const promises = entries.map(async (entry) => {
            const fullPath = path.join(directory, entry.name);


            // Exclude directories if specified
            if (excludeDirs.some(it=>fullPath.includes(it))) {
                return [];
            }

            if (entry.isDirectory()) {
                // Check for deploy.json directly to avoid unnecessary directory traversal
                try {
                    await fs.access(path.join(fullPath, fileName));
                    return [path.join(fullPath, fileName)];
                } catch {
                    // Recursively scan the subdirectory in parallel
                    return scanDirectory(fullPath);
                }
            }
            return [];
        });

        // Wait for all the directory scans to complete and collect their results
        (await Promise.all(promises)).forEach(files => {
            deployJsonFiles = deployJsonFiles.concat(files);
        });

        return deployJsonFiles;
    }

    return scanDirectory(root);
}

