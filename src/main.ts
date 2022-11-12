import "./style.css";
import { Project } from "./types";
// import projectsView from "./views/projects.html?raw";
import { ProjectsView } from "./views/projects";

const viewContainer = document.getElementById("view") as HTMLDivElement;

const projectsView = new ProjectsView(viewContainer);
projectsView.render();

