import "./style.css";
import { Route, Router } from "./util/router";
import { RecordView } from "./views/record-view";
import { PlaygroundView } from "./views/playground-view";
import { DatasetsView } from "./views/datasets-view";
import { DatasetView } from "./views/dataset-view";
import { getRecords } from "./db/records";
import { getDatasets } from "./db/datasets";

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
];
export const router = new Router(window, routes);
router.navigateTo(window.location.pathname);
