import { Job } from "../types";
import * as db from "./base";

export function getJobs(): Job[] {
  return db.getItems("jobs") || [];
}

export function createJob(job: Job) {
  db.createItem("jobs", job);
}

export function updateJob(job: Job) {
  db.updateItem("jobs", job);
}

export function deleteJob(job: Job) {
  db.deleteItem("jobs", job);
}
