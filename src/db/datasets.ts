import * as db from "./base";
import { Dataset } from "../types";

export function getDatasets() {
  return db.getItems("datasets") || [];
}

export function createDataset(dataset: Dataset) {
  db.createItem("datasets", dataset);
}

export function updateDataset(dataset: Dataset) {
  db.updateItem("datasets", dataset);
}

export function deleteDataset(dataset: Dataset) {
  db.deleteItem("datasets", dataset);
}
