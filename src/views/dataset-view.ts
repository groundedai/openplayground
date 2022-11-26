import datasetViewHtml from "./dataset-view.html?raw";
import { DataTable } from "../components/datatable";
import { getRecords } from "../db/records";
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

}
