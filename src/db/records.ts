import { Record } from "../types";

export function getRecords() {
  const records = localStorage.getItem("records");
  if (records) {
    return JSON.parse(records);
  }
  return [];
}

export function createRecord(record: Record) {
  const recordItems = getRecords();
  recordItems.push(record);
  localStorage.setItem("records", JSON.stringify(recordItems));
}

export function updateRecord(record: Record) {
  const recordItems = getRecords();
  const index = recordItems.findIndex((r: Record) => r.id === record.id);
  recordItems[index] = record;
  localStorage.setItem("records", JSON.stringify(recordItems));
}