import "./style.css";
import { Route, Router } from "./util/router";
import { ProjectsView } from "./views/projects-view";
import { ProjectView } from "./views/project-view";
import { RecordView } from "./views/record-view";
import { getProjects } from "./db/projects";
import { getRecords } from "./db/records";
import { Project } from "./types";
import { Record } from "./types";

const container = document.querySelector("#view") as HTMLDivElement;
const routes = [
  new Route("/projects/?$", () => {
    const projectsView = new ProjectsView(container);
    projectsView.render();
  }),
  new Route("/([0-9a-zA-Z-]+)/record/([0-9a-zA-Z-]+)/?$", (path: string) => {
    const projectId = path.split("/")[1];
    const recordId = path.split("/")[3];
    console.log("Project ID", projectId);
    console.log("Record ID", recordId);
    const record = getRecords().find(
      (r: Record) => r.projectId === projectId && r.id === recordId
      );
      const recordView = new RecordView(container, record, {});
      recordView.render();
    }),
    new Route("/([0-9a-zA-Z-]+)/?$", (path: string) => {
      const projectId = path.split("/")[1];
      console.log("Project ID", projectId);
      const project = getProjects().find((p: Project) => p.id === projectId);
      const projectView = new ProjectView(container, project);
      projectView.render();
    }),
];
export const router = new Router(window, routes);
router.navigateTo(window.location.pathname);
