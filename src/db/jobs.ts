import { Job } from "../types";
import * as db from "./base";

export function getJobs(): Job[] {
  const jobs = db.getItems("jobs") || [];
  const objs = jobs.map((j) => new Job(j));
  return objs;
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
