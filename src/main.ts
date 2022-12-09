import { Route, Router } from "./util/router";
import { Navbar } from "./components/navbar";
import { PlaygroundView } from "./views/playground-view";
import { DatasetsView } from "./views/datasets-view";
import { DatasetView } from "./views/dataset-view";
import { RunsView } from "./views/runs-view";
import { RunView } from "./views/run-view";
import { CompareView } from "./views/compare-view";
import { IntroView } from "./views/intro-view";
import { DB } from "./db";
import { Dataset, Run } from "./types";
import { loadExamplePresets } from "./presets";
import { loadExampleDatasets } from "./datasets";
import { loadExampleRuns } from "./runs";

export const db = new DB();
loadExamplePresets();
loadExampleDatasets();
loadExampleRuns();

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
    const dataset = db.getDatasets().find((d: Dataset) => d.id === datasetId);
    const datasetView = new DatasetView({ container, dataset });
    datasetView.render();
  }),
  new Route("/runs/?$", () => {
    const runsView = new RunsView({ container });
    runsView.render();
  }),
  new Route("/runs/(\\d+)/?$", (path: string) => {
    const runId = path.split("/")[2];
    const run = db.getRuns().find((r: Run) => r.id === runId);
    const runView = new RunView({ container, run });
    runView.render();
  }),
  new Route("/runs/compare/(\\d+)/(\\d+)/?$", (path: string) => {
    const runIdA = path.split("/")[3];
    const runIdB = path.split("/")[4];
    const runA = db.getRuns().find((r: Run) => r.id === runIdA);
    const runB = db.getRuns().find((r: Run) => r.id === runIdB);
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
