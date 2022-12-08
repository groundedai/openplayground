import { Dataset, Record } from "./types";
import { db } from "./main";
import SemanticScholarCoffee from "./data/examples/datasets/semantic-scholar-coffee.md?raw";

const exampleDatasetsRaw: { [key: string]: string } = {
  "Semantic scholar coffee": SemanticScholarCoffee,
};

export function parseRecords(data: string, separator: string): Array<Record> {
  let records = data.split(separator);
  records = records.map((record) => {
    return record.trim();
  });
  records = records.filter((record) => {
    return record.length > 0;
  });
  const recordObjs = records.map((record) => {
    return new Record({ text: record });
  });
  return recordObjs;
}

export function loadExampleDatasets(): void {
  Object.keys(exampleDatasetsRaw).forEach((name) => {
    const dataset = new Dataset({ name, isExample: true });
    // Check if dataset already exists
    const existingDatasets = db.getDatasets();
    const existingDataset = existingDatasets.find(
      (existingDataset: Dataset) => existingDataset.name === name
    );
    if (existingDataset) {
      return;
    }
    const data: string = exampleDatasetsRaw[name];
    const records = parseRecords(data, "---");
    db.createDataset(dataset);
    records.forEach((record) => {
      record.datasetId = dataset.id;
      db.createRecord(record);
    });
    return dataset;
  });
}
