import { Run } from "../types";
import * as db from "./base";

export function getRuns(): Run[] {
  const runs = db.getItems("runs") || [];
  const objs = runs.map((j) => new Run(j));
  return objs;
}

export function createRun(run: Run) {
  db.createItem("runs", run);
}

export function updateRun(run: Run) {
  db.updateItem("runs", run);
}

export function deleteRun(run: Run) {
  db.deleteItem("runs", run);
}
