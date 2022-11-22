import * as db from "./base";
import { Dataset } from "../types";
import { deleteRecord } from "./records";

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
  // Delete all records for this dataset
  const records = db.getItems("records");
  records.forEach((r) => {
    if (r.datasetId === dataset.id) {
      deleteRecord(r);
    }
  });
}
