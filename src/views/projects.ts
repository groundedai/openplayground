import { Project } from "../types";
import projectsView from "./projects.html?raw";
import { getProjects, createProject } from "../db";

export class ProjectsView {
  container: HTMLDivElement;

  constructor(container: HTMLDivElement) {
    this.container = container;
  }

  render() {
    const html = projectsView;
    this.container.innerHTML = html;
    const projectsDiv = document.getElementById("projects") as HTMLDivElement;
    const projects = getProjects();
    if (projects.length > 0) {
      const projectsList = document.createElement("projects-list");
      projects.forEach((project: Project) => {
        const li = document.createElement("li");
        li.innerHTML = project.name;
        projectsList.appendChild(li);
      });
      projectsDiv.appendChild(projectsList);
    }
    this.addListeners();
  }

  addListeners() {
    const newProjectForm = document.getElementById(
      "new-project-form"
    ) as HTMLFormElement;
    newProjectForm.addEventListener("submit", (e: Event) => {
      e.preventDefault();
      const project = new Project({
        name: (document.getElementById("project-name") as HTMLInputElement)
          .value,
      });
      createProject(project);
      console.log("Project created", project);
      this.render();
    });
  }
}
