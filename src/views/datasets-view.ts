import datasetsViewCss from "./datasets-view.css?raw";
import { Dataset } from "../types";
import { getDatasets, deleteDataset } from "../db/datasets";
import { getRuns, deleteRun } from "../db/runs";
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
    this.newDatasetModal.render();
    const datasets = getDatasets().map((d: Dataset) => ({
      id: d.id!,
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
        classes: ["text-center"],
      },
      {
        name: "Actions",
        key: "actions",
        classes: ["text-center"],
      },
    ];
    const emptyMessage = "You don't have any datasets yet. Create one";
    const dataTable = new DataTable({
      container: this.datasetTableContainer,
      rows: datasets,
      columns: datasetsColumns,
      emptyMessage,
    });
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
          const runs = getRuns().filter((r) => r.datasetId === id);
          console.log(runs);
          let confirmMessage = `Are you sure you want to delete dataset ${dataset?.name}?`;
          if (runs.length > 0) {
            confirmMessage += ` This will also delete ${runs.length} runs associated with this dataset.`;
          }
          const confirm = window.confirm(confirmMessage);
          if (confirm) {
            runs.forEach((r) => {
              deleteRun(r);
            });
            deleteDataset(dataset);
            this.showSnackbar({
              messageHtml: `Dataset <strong>${dataset?.name}</strong> deleted`,
              type: "success",
            });
            this.render();
          }
        }
      });
    });
  }

  initListeners() {
    this.createDatasetButton.addEventListener("click", () => {
      this.newDatasetModal.show();
    });
  }
}
