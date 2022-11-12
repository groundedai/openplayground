import { Project } from "../types";
import projectsViewHTML from "./projects-view.html?raw";
import { ProjectView } from "./project-view";
import { getProjects, createProject } from "../db/projects";

export class ProjectsView {
  container: HTMLDivElement;

  constructor(container: HTMLDivElement) {
    this.container = container;
  }

  render() {
    const html = projectsViewHTML;
    this.container.innerHTML = html;
    const projectsDiv = document.getElementById("projects") as HTMLDivElement;
    const projects = getProjects();
    if (projects.length > 0) {
      projectsDiv.innerHTML = "";
      const projectsList = document.createElement("projects-list");
      projects.forEach((project: Project) => {
        const li = document.createElement("li");
        li.innerHTML = `<button class="open-project" data-id="${project.id}">${project.name}</button>`;
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
    const openProjectButtons = document.getElementsByClassName(
      "open-project"
    ) as HTMLCollectionOf<HTMLButtonElement>;

    for (let i = 0; i < openProjectButtons.length; i++) {
      const button = openProjectButtons[i];
      button.addEventListener("click", (e: Event) => {
        e.preventDefault();
        if (button.dataset.id) {
          const id: number = parseInt(button.dataset.id);
          console.log("Open project", id);
          const project = getProjects().find((p: Project) => p.id === id);
          const projectView = new ProjectView(this.container, project);
          projectView.render();
        }
      });
    }
  }
}
