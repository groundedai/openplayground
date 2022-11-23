import datasetsViewCss from "./datasets-view.css?raw";
import { Dataset } from "../types";
import { getDatasets, createDataset, deleteDataset } from "../db/datasets";
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
    super({ container, html: datasetViewHtml, css: datasetsViewCss });
  }

  render() {
    const datasets = getDatasets().map((d: Dataset) => ({
      id: d.id,
      name: d.name,
      actions: `<button class="outline" data-id="${d.id}" data-action="view">View</button> <button class="outline danger" data-id="${d.id}" data-action="delete">Delete</button>`,
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
      {
        name: "Actions",
        key: "actions",
      },
    ];
    const emptyMessage = "You don't have any datasets yet. Create one";
    const dataTable = new DataTable(
      this.datasetTableContainer,
      datasets,
      datasetsColumns,
      emptyMessage
    );
    dataTable.render();
    // Add button listeners
    const viewButtons = document.querySelectorAll(
      "#dataset-table-container button[data-action='view']"
    );
    viewButtons.forEach((b) => {
      b.addEventListener("click", (e) => {
        const id = (e.target as HTMLButtonElement).dataset.id;
        if (id) {
          router.goTo(`/datasets/${id}`);
        }
      });
    });
    const deleteButtons = document.querySelectorAll(
      "#dataset-table-container button[data-action='delete']"
    );
    deleteButtons.forEach((b) => {
      b.addEventListener("click", (e) => {
        const id = (e.target as HTMLButtonElement).dataset.id;
        const dataset = getDatasets().find((d) => d.id === id);
        if (id) {
          const confirm = window.confirm(
            `Are you sure you want to delete dataset ${dataset?.name}?`
          );
          if (confirm) {
            deleteDataset(dataset);
            this.render();
          }
        }
      });
    });
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
