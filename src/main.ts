import { Route, Router } from "./util/router";
import { Navbar } from "./components/navbar";
import { RecordView } from "./views/record-view";
import { PlaygroundView } from "./views/playground-view";
import { DatasetsView } from "./views/datasets-view";
import { DatasetView } from "./views/dataset-view";
import { RunsView } from "./views/runs-view";
import { RunView } from "./views/run-view";
import { CompareView } from "./views/compare-view";
import { IntroView } from "./views/intro-view";
import { getRecords } from "./db/records";
import { getDatasets } from "./db/datasets";
import { getRuns } from "./db/runs";

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
  new Route("/datasets/(\\d+)/record/(\\d+)/?$", (path: string) => {
    const datasetId = path.split("/")[2];
    const recordId = path.split("/")[4];
    console.log("recordId", recordId);
    const record = getRecords().find(
      (r) => r.datasetId === datasetId && r.id === recordId
    );
    const recordView = new RecordView({ container, record });
    recordView.render();
  }),
  new Route("/runs/?$", () => {
    const runsView = new RunsView({ container });
    runsView.render();
  }),
  new Route("/runs/(\\d+)/?$", (path: string) => {
    const runId = path.split("/")[2];
    const run = getRuns().find((j) => j.id === runId);
    const runView = new RunView({ container, run });
    runView.render();
  }),
  new Route("/runs/compare/(\\d+)/(\\d+)/?$", (path: string) => {
    const runIdA = path.split("/")[3];
    const runIdB = path.split("/")[4];
    const runA = getRuns().find((j) => j.id === runIdA);
    const runB = getRuns().find((j) => j.id === runIdB);
    const compareView = new CompareView({ container, runA, runB });
    compareView.render();
  }),
  new Route("/intro/?$", () => {
    const introView = new IntroView({ container });
    introView.render();
  }),
  new Route("/?$", () => {
    const playgroundView = new PlaygroundView({ container });
    playgroundView.render();
  }),
];
export const router = new Router(window, routes);
router.navigateTo(window.location.hash || "#/");

const navContainer = document.getElementById("nav") as HTMLDivElement;
new Navbar({ container: navContainer });

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
