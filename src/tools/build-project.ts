import {NodeProject} from "../models/node-project.js";
import {execa} from "execa";


export async function buildProject(project: NodeProject) {
	const exec = async (c: string) => {
		const res = await execa(c, {
			cwd: project.path,
			shell: true,
			stderr: 'pipe',
			stdout: 'pipe',
		})

		if (res.failed || res.stderr)
			throw `Failed ${res.stderr}`
	}

	await exec("pnpm i")
	await exec(`pnpm link --global ${project.dependencies.join(" ")}`)
	await exec("pnpm run build")
	if (project.isLib)
		await exec("pnpm link --global")

}
