import { Record } from "../types";
import * as db from "./base";

export function getRecords() {
  return db.getItems("records") || [];
}

export function createRecord(record: Record) {
  db.createItem("records", record);
}

export function updateRecord(record: Record) {
  db.updateItem("records", record);
}

export function deleteRecord(record: Record) {
  db.deleteItem("records", record);
}
