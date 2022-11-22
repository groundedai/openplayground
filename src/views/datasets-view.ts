import "./datasets-view.css";
import { Dataset } from "../types";
import { getDatasets, createDataset } from "../db/datasets";
import datasetViewHtml from "./datasets-view.html?raw";
import { DataTable } from "../components/datatable";
import { router } from "../main";
import { View } from "./view";

export class DatasetsView extends View {
  datasetTableContainer: HTMLDivElement = document.querySelector(
    "#dataset-table-container"
  ) as HTMLDivElement;
  newDatasetForm: HTMLFormElement = document.querySelector(
    "#new-dataset-form"
  ) as HTMLFormElement;

  constructor({ container }: { container: HTMLDivElement }) {
    super({ container, html: datasetViewHtml });
  }

  render() {
    const datasets = getDatasets().map((d: Dataset) => ({
      id: d.id,
      name: d.name,
    }));
    const datasetsColumns = [
      {
        name: "ID",
        key: "id",
      },
      {
        name: "Name",
        key: "name",
      },
    ];
    const rowClicked = (row: any) => {
      router.goTo(`/datasets/${row.id}`);
    };
    const emptyMessage = "You don't have any datasets yet. Create one";
    const dataTable = new DataTable(
      this.datasetTableContainer,
      datasets,
      datasetsColumns,
      emptyMessage,
      rowClicked
    );
    dataTable.render();
    this.addListeners();
  }

  addListeners() {
    this.newDatasetForm?.addEventListener("submit", (e: Event) => {
      e.preventDefault();
      const name = (
        document.querySelector("#new-dataset-name") as HTMLInputElement
      ).value;
      const highestId = getDatasets().reduce((acc: number, d: Dataset) => {
        const id = parseInt(d.id);
        return id > acc ? id : acc;
      }, 0);
      const newId = highestId + 1;
      const dataset = new Dataset({ name, id: newId.toString() });
      createDataset(dataset);
      console.log("Dataset created", dataset);
      this.render();
    });
  }
}
