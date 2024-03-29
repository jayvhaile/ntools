import {NodeProject} from "../models/node-project.js";
import {execa} from "execa";

export async function cleanProject(project: NodeProject) {
    await execa('rm -rf node_modules && rm -rf dist && rm -rf out', {
        cwd: project.path,
        shell: true,
        stderr: 'pipe',
        stdout: 'pipe',
    })
	await execa('rm pnpm-lock.yaml', {
		cwd: project.path,
		shell: true,
		stderr: 'pipe',
		stdout: 'pipe',
	}).catch(() => {})
}
