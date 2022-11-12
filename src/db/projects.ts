import { Project } from "../types";

export function getProjects() {
  const projects: string | null = localStorage.getItem("projects");
  if (projects) {
    return JSON.parse(projects);
  } else {
    return [];
  }
}

export function createProject(project: Project) {
  const projects = getProjects();
  projects.push(project);
  localStorage.setItem("projects", JSON.stringify(projects));
}

export function updateProject(project: Project) {
  const projects = getProjects();
  const index = projects.findIndex((p: Project) => p.id === project.id);
  projects[index] = project;
  localStorage.setItem("projects", JSON.stringify(projects));
}
