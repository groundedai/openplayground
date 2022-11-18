import "./style.css";
import { Route, Router } from "./util/router";
import { RecordView } from "./views/record-view";
import { PlaygroundView } from "./views/playground-view";
import { DatasetsView } from "./views/datasets-view";
import { DatasetView } from "./views/dataset-view";
import { JobsView } from "./views/jobs-view";
import { JobView } from "./views/job-view";
import { getRecords } from "./db/records";
import { getDatasets } from "./db/datasets";
import { getJobs } from "./db/jobs";

const container = document.querySelector("#view") as HTMLDivElement;
const routes = [
  new Route("/playground/?$", () => {
    const playgroundView = new PlaygroundView(container);
    playgroundView.render();
  }),
  new Route("/datasets/?$", () => {
    const datasetsView = new DatasetsView(container);
    datasetsView.render();
  }),
  new Route("/datasets/(\\d+)/?$", (path: string) => {
    const datasetId = path.split("/")[2];
    const dataset = getDatasets().find((d) => d.id === datasetId);
    console.log("dataset", dataset);
    const datasetView = new DatasetView(container, dataset);
    datasetView.render();
  }),
  new Route("datasets/(\\d+)/record/(\\d+)/?$", (path: string) => {
    const datasetId = path.split("/")[2];
    const recordId = path.split("/")[4];
    console.log("recordId", recordId);
    const record = getRecords().find(
      (r) => r.datasetId === datasetId && r.id === recordId
    );
    const recordView = new RecordView(container, record);
    recordView.render();
  }),
  new Route("/jobs/?$", () => {
    const jobsView = new JobsView(container);
    jobsView.render();
  }),
  new Route("/jobs/(\\d+)/?$", (path: string) => {
    const jobId = path.split("/")[2];
    const job = getJobs().find((j) => j.id === jobId);
    const jobView = new JobView(container, job);
    jobView.render();
  }),
];
export const router = new Router(window, routes);
router.navigateTo(window.location.pathname);
