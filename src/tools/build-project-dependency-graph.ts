import {Graph} from "@dagrejs/graphlib";
import {NodeProject} from "../models/node-project.js";

export function buildProjectDependencyGraph(projects: NodeProject[]) {
	let graph = new Graph();

	projects.forEach(project => {
		graph.setNode(project.name)
		project.dependencies.forEach(dep => {
			graph.setEdge(dep,project.name)
		})
	})

	return graph;
}
