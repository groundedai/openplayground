import datasetViewHtml from "./dataset-view.html?raw";
import { DataTable } from "../components/datatable";
import { getRecords, createRecord } from "../db/records";
import { Dataset, Record } from "../types";
import { router } from "../main";
import { deleteDataset } from "../db/datasets";
import { View } from "./view";

export class DatasetView extends View {
  dataset: Dataset;
  records: Array<Record> = [];
  recordsTableContainer: HTMLDivElement = document.getElementById(
    "records-table-container"
  ) as HTMLDivElement;
  newDataForm: HTMLFormElement = document.getElementById(
    "new-data-form"
  ) as HTMLFormElement;
  deleteDatasetButton: HTMLButtonElement = document.getElementById(
    "delete-dataset-button"
  ) as HTMLButtonElement;

  constructor({
    container,
    dataset,
  }: {
    container: HTMLDivElement;
    dataset: Dataset;
  }) {
    const props = {
      datasetName: dataset.name,
    };
    super({
      container,
      html: datasetViewHtml,
      props,
    });
    this.dataset = dataset;
  }

  render() {
    this.records = getRecords().filter((r: Record) => {
      return r.datasetId === this.dataset.id;
    });
    this.recordsTableContainer.innerHTML = "";
    const columns = [
      { name: "ID", key: "id" },
      { name: "Text", key: "text" },
    ];
    const rows = this.records.map((r) => {
      // Replace newlines or breaks in the text with a space
      const text = r.text.replace(/(\r\n|\n|\r)/gm, " ");
      // return { id: r.id, text: mdToHtml(text) };
      return { id: r.id, text };
    });
    const rowClicked = (row: any) => {
      console.log("Row clicked", row);
      const record = this.records.find((r) => r.id === row.id);
      if (record) {
        router.goTo(`/datasets/${this.dataset.id}/record/${record.id}`);
      }
    };
    const dataTable = new DataTable(
      this.recordsTableContainer,
      rows,
      columns,
      "No records yet. Upload some:",
      rowClicked
    );
    dataTable.render();
    this.addListeners();
  }

  addListeners() {
    this.newDataForm?.addEventListener("submit", (e: Event) => {
      e.preventDefault();
      const dataFile = (
        document.getElementById("data-file") as HTMLInputElement
      ).files?.[0];
      if (dataFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result;
          if (data) {
            const separator = (
              document.getElementById("data-separator") as HTMLInputElement
            ).value;
            const dataString = data.toString();
            const records = this.parseRecords(dataString, separator);
            console.log("Data uploaded", records);
            records.forEach((record) => {
              createRecord(record);
            });
            this.render();
          }
        };
        reader.readAsText(dataFile);
      }
    });
    this.deleteDatasetButton?.addEventListener("click", (e: Event) => {
      e.preventDefault();
      console.log("Delete dataset");
      const confirmed = confirm(
        "Are you sure you want to delete this dataset?"
      );
      if (confirmed) {
        deleteDataset(this.dataset);
        router.goTo("/projects");
      }
    });
  }

  parseRecords(data: string, separator: string): Array<Record> {
    let records = data.split(separator);
    records = records.map((record) => {
      return record.trim();
    });
    records = records.filter((record) => {
      return record.length > 0;
    });
    let highestId = 0;
    this.records.forEach((record) => {
      const id = parseInt(record.id);
      if (id > highestId) {
        highestId = id;
      }
    });
    const recordObjs = records.map((record) => {
      const newId = highestId + 1;
      highestId = newId;
      return new Record({
        text: record,
        datasetId: this.dataset.id,
        id: newId,
      });
    });
    return recordObjs;
  }
}
