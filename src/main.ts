// import "./style.css";
import { Route, Router } from "./util/router";
import { RecordView } from "./views/record-view";
import { PlaygroundView } from "./views/playground-view";
import { DatasetsView } from "./views/datasets-view";
import { DatasetView } from "./views/dataset-view";
import { JobsView } from "./views/jobs-view";
import { JobView } from "./views/job-view";
import { CompareView } from "./views/compare-view";
import { getRecords } from "./db/records";
import { getDatasets } from "./db/datasets";
import { getJobs } from "./db/jobs";

const container = document.querySelector("#view") as HTMLDivElement;
const routes = [
  new Route("/playground/?$", () => {
    const playgroundView = new PlaygroundView({ container });
    playgroundView.render();
  }),
  new Route("/datasets/?$", () => {
    const datasetsView = new DatasetsView({ container });
    datasetsView.render();
  }),
  new Route("/datasets/(\\d+)/?$", (path: string) => {
    const datasetId = path.split("/")[2];
    const dataset = getDatasets().find((d) => d.id === datasetId);
    console.log("dataset", dataset);
    const datasetView = new DatasetView({ container, dataset });
    datasetView.render();
  }),
  new Route("datasets/(\\d+)/record/(\\d+)/?$", (path: string) => {
    const datasetId = path.split("/")[2];
    const recordId = path.split("/")[4];
    console.log("recordId", recordId);
    const record = getRecords().find(
      (r) => r.datasetId === datasetId && r.id === recordId
    );
    const recordView = new RecordView({ container, record });
    recordView.render();
  }),
  new Route("/jobs/?$", () => {
    const jobsView = new JobsView({ container });
    jobsView.render();
  }),
  new Route("/jobs/(\\d+)/?$", (path: string) => {
    const jobId = path.split("/")[2];
    const job = getJobs().find((j) => j.id === jobId);
    const jobView = new JobView({ container, job });
    jobView.render();
  }),
  new Route("/compare/(\\d+)+(\\d+)/?$", (path: string) => {
    const jobIdA = path.split("/")[2].split("+")[0];
    const jobIdB = path.split("/")[2].split("+")[1];
    const jobA = getJobs().find((j) => j.id === jobIdA);
    const jobB = getJobs().find((j) => j.id === jobIdB);
    const compareView = new CompareView({ container, jobA, jobB });
    compareView.render();
  }),
  new Route("/?$", () => {
    const playgroundView = new PlaygroundView({ container });
    playgroundView.render();
  }),
];
export const router = new Router(window, routes);
router.navigateTo(window.location.pathname);

// const rightNav = document.querySelector("#right-nav") as HTMLDivElement;
// const rightNavContent = document.querySelector(
//   "#right-nav-content"
// ) as HTMLDivElement;
// const rightNavExpandButton = document.querySelector(
//   "#right-nav-expand-button"
// ) as HTMLButtonElement;
// const expandLeftNavIcon = document.querySelector(
//   "#expand-left-nav-icon"
// ) as HTMLElement;
// const expandRightNavIcon = document.querySelector(
//   "#expand-right-nav-icon"
// ) as HTMLElement;
// rightNavExpandButton.addEventListener("click", () => {
//   console.log("click");
//   rightNav.classList.toggle("collapsed");
//   expandLeftNavIcon.classList.toggle("hidden");
//   expandRightNavIcon.classList.toggle("hidden");
// });
