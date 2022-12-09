import datasetsViewCss from "./datasets-view.css?raw";
import { Dataset, Run } from "../types";
import { db } from "../main";
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
  hideExampleDatasetsCheckbox: HTMLInputElement = document.querySelector(
    "#hide-example-datasets-checkbox"
  ) as HTMLInputElement;
  hideExampleDatasets: boolean = false;

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
    let datasetRows = db.getDatasets().map((d: Dataset) => {
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("outline");
      deleteButton.classList.add("icon");
      deleteButton.title = "Delete preset";
      deleteButton.dataset.action = "delete";
      deleteButton.dataset.id = d.id as string;
      deleteButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;
      // If preset is an example preset, disable delete button
      if (d.isExample) {
        deleteButton.disabled = true;
        deleteButton.innerHTML = `<div class="tooltip"><i class="fa-solid fa-trash"></i><span class="tooltiptext">Example datasets cannot be deleted. You can hide them by clicking the "Hide example datasets" button.</span></div>`;
      }
      const actionsHtml = `<button data-action="view" data-id="${d.id}" class="outline icon" title="View dataset"><i class="fa-solid fa-eye"></i></button> ${deleteButton.outerHTML} `;
      return {
        id: d.id!,
        name: d.name,
        isExample: d.isExample,
        actions: actionsHtml,
      };
    });
    if (this.hideExampleDatasets) {
      datasetRows = datasetRows.filter((d: any) => !d.isExample);
    }
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
    const emptyMessage = "No datasets";
    const dataTable = new DataTable({
      container: this.datasetTableContainer,
      rows: datasetRows,
      columns: datasetsColumns,
      emptyMessage,
    });
    dataTable.render();
    const viewButtons = this.datasetTableContainer.querySelectorAll(
      "button[data-action='view']"
    ) as NodeListOf<HTMLButtonElement>;
    viewButtons.forEach((b: HTMLButtonElement) => {
      b.addEventListener("click", () => {
        const id = b.dataset.id;
        if (id) {
          router.goTo(`/datasets/${id}`);
        }
      });
    });
    const deleteButtons = this.datasetTableContainer.querySelectorAll(
      "button[data-action='delete']"
    ) as NodeListOf<HTMLButtonElement>;
    deleteButtons.forEach((b: HTMLButtonElement) => {
      b.addEventListener("click", () => {
        const id = b.dataset.id;
        const dataset = db.getDatasets().find((d: Dataset) => d.id === id);
        if (id) {
          const runs = db.getRuns().filter((r: Run) => r.datasetId === id);
          console.log(runs);
          let confirmMessage = `Are you sure you want to delete dataset ${dataset?.name}?`;
          if (runs.length > 0) {
            confirmMessage += ` This will also delete ${runs.length} runs associated with this dataset.`;
          }
          const confirm = window.confirm(confirmMessage);
          if (confirm) {
            runs.forEach((r: Run) => {
              db.deleteRun(r);
            });
            db.deleteDataset(dataset);
            this.showSnackbar({
              messageHtml: `Dataset <strong>${dataset?.name}</strong> deleted`,
              type: "success",
            });
            this.render();
          }
        }
      });
    });
    this.newDatasetModal.render();
  }

  initListeners() {
    this.createDatasetButton.addEventListener("click", () => {
      this.newDatasetModal.show();
    });
    this.hideExampleDatasetsCheckbox.addEventListener("change", (e) => {
      this.hideExampleDatasets = (e.target as HTMLInputElement).checked;
      this.render();
    });
  }
}
