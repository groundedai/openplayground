import datasetsViewCss from "./datasets-view.css?raw";
import { Dataset } from "../types";
import { getDatasets, deleteDataset } from "../db/datasets";
import datasetViewHtml from "./datasets-view.html?raw";
import { DataTable } from "../components/datatable";
import { router } from "../main";
import { View } from "./view";
import { Modal } from "../components/modal";
import { NewDatasetForm } from "../components/new-dataset-form";

export class DatasetsView extends View {
  datasetTableContainer: HTMLDivElement = document.querySelector(
    "#dataset-table-container"
  ) as HTMLDivElement;
  createDatasetButton: HTMLButtonElement = document.querySelector(
    "#create-dataset-button"
  ) as HTMLButtonElement;
  newDatasetModal: Modal;

  constructor({ container }: { container: HTMLDivElement }) {
    super({ container, html: datasetViewHtml, css: datasetsViewCss });
    const newDatasetForm = new NewDatasetForm({
      onSubmit: (dataset: Dataset) => {
        this.render();
        this.showSnackbar({
          messageHtml: `Dataset <strong>${dataset.name}</strong> created`,
          type: "success",
        });
        this.newDatasetModal.hide();
      },
    });
    this.newDatasetModal = new Modal({
      title: "New Dataset",
      body: newDatasetForm.container,
    });
    this.initListeners();
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
  }

  initListeners() {
    this.createDatasetButton.addEventListener("click", () => {
      this.newDatasetModal.render();
      this.newDatasetModal.show();
    });
  }
}
