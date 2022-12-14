import runsViewCss from "./runs-view.css?raw";
import { Run, ResultStatus, Dataset, Preset, ID } from "../types";
import { db } from "../main";
import { DataTable } from "../components/datatable";
import runsViewHtml from "./runs-view.html?raw";
import { titleCase } from "../util/string";
import { router } from "../main";
import { View } from "./view";
import { NewRunForm } from "../components/new-run-form";
import { Modal } from "../components/modal";
import { startRun, exportRun, makeStartingRunMessage } from "../runs";
import { errorMessageDuration } from "../globals";
export class RunsView extends View {
  runsTable: DataTable | null = null;
  runsTableContainer: HTMLDivElement = document.querySelector(
    "#runs-table-container"
  ) as HTMLDivElement;
  compareButton: HTMLButtonElement = document.querySelector(
    "#compare-button"
  ) as HTMLButtonElement;
  createRunButton: HTMLButtonElement = document.querySelector(
    "#create-run-button"
  ) as HTMLButtonElement;
  newRunModal: Modal;

  constructor({ container }: { container: HTMLDivElement }) {
    super({ container, html: runsViewHtml, css: runsViewCss });
    const newRunForm = this.makeNewRunForm();
    this.newRunModal = new Modal({
      title: "New Run",
      body: newRunForm.container,
    });
    this.initListeners();
  }

  render() {
    this.renderRunsTable();
  }

  renderRunsTable() {
    const rows = db.getRuns().map((run: Run) => {
      const dataset = db
        .getDatasets()
        .find((dataset: Dataset) => dataset.id === run.datasetId);
      const preset = db
        .getPresets()
        .find((preset: Preset) => preset.id === run.presetId);
      const runStatus = run.getStatus();
      let statusMessage = "";
      if (runStatus.status === ResultStatus.failed) {
        const nFailed = runStatus.failedRecords.length;
        statusMessage = `Failed (${nFailed})`;
      } else if (runStatus.status === ResultStatus.running) {
        const nCompleted = runStatus.completedRecords.length;
        const nTotal = runStatus.totalRecords;
        statusMessage = `Running (${nCompleted}/${nTotal})`;
      } else {
        statusMessage = runStatus.status;
      }
      return {
        id: run.id!,
        name: run.name,
        status: titleCase(statusMessage),
        dataset: dataset?.name || "Not found",
        preset: preset?.name || "Not found",
        actions: `<button id="start-run-button" data-id="${run.id}" class="outline icon" title="Start" data-action="start"><i class="fas fa-play"></i></button> <button id="view-run-button" data-id="${run.id}" class="outline icon" title="View" data-action="view"><i class="fas fa-eye"></i></button> <button id="delete-run-button" data-id="${run.id}" class="outline icon" title="Delete" data-action="delete"><i class="fas fa-trash"></i></button> <button id="export-run-button" data-id="${run.id}" class="outline icon" title="Export" data-action="export"><i class="fas fa-download"></i></button>`,
        select: `<input type="checkbox" id="select-run" data-id="${run.id}" />`,
        createdAt: `${run.createdAt.toLocaleDateString()} ${run.createdAt.getHours()}:${run.createdAt.getMinutes()}`,
      };
    });
    rows.sort((a: Run, b: Run) => (a.createdAt > b.createdAt ? -1 : 1)); // Sort by recent first
    console.log(rows);
    const columns = [
      { key: "select", name: "Select" },
      { key: "name", name: "Name" },
      { key: "status", name: "Status", classes: ["text-center"] },
      { key: "dataset", name: "Dataset" },
      { key: "preset", name: "Preset" },
      { key: "actions", name: "Actions" },
      { key: "createdAt", name: "Created At" },
    ];
    this.runsTable = new DataTable({
      container: this.runsTableContainer,
      columns,
      rows,
      emptyMessage: "No runs",
    });
    this.runsTable.render();
    this.addRunsTableListeners();
  }

  addRunsTableListeners() {
    const startRunButtons = document.querySelectorAll(
      "#start-run-button"
    ) as NodeListOf<HTMLButtonElement>;
    startRunButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.startRun(button.dataset.id!);
      });
    });
    const viewRunButtons = document.querySelectorAll(
      "#view-run-button"
    ) as NodeListOf<HTMLButtonElement>;
    viewRunButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.viewRun(button.dataset.id!);
      });
    });
    const deleteRunButtons = document.querySelectorAll(
      "#delete-run-button"
    ) as NodeListOf<HTMLButtonElement>;
    deleteRunButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.deleteRun(button.dataset.id!);
      });
    });
    const selectRunCheckboxes = document.querySelectorAll(
      "#select-run"
    ) as NodeListOf<HTMLInputElement>;
    selectRunCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.updateCompareButton();
      });
    });
    // Check boxes when clicking on cell
    const selectRunCells = document.querySelectorAll(
      "td[data-column='select']"
    ) as NodeListOf<HTMLTableCellElement>;
    selectRunCells.forEach((cell) => {
      cell.addEventListener("click", (event) => {
        const checkbox = cell.querySelector(
          "input[type='checkbox']"
        ) as HTMLInputElement;
        if (event.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
          this.updateCompareButton();
        }
      });
    });
    const exportButtons = document.querySelectorAll(
      "#export-run-button"
    ) as NodeListOf<HTMLButtonElement>;
    exportButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.exportRun(button.dataset.id!);
      });
    });
  }

  getSelectedRuns() {
    const selectRunCheckboxes = document.querySelectorAll(
      "#select-run"
    ) as NodeListOf<HTMLInputElement>;
    const selectedRuns: Run[] = [];
    selectRunCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const runId = checkbox.dataset.id!;
        const run = db.getRuns().find((run: Run) => run.id === runId);
        if (run) {
          selectedRuns.push(run);
        }
      }
    });
    return selectedRuns;
  }

  updateCompareButton() {
    const selectedRuns = this.getSelectedRuns();
    if (selectedRuns.length > 1) {
      this.compareButton.disabled = false;
    } else {
      this.compareButton.disabled = true;
    }
  }

  startRun(id: ID) {
    const run = db.getRuns().find((run: Run) => run.id === id);
    if (!run) {
      return;
    }
    const onStart = () => {
      this.showSnackbar({ messageHtml: makeStartingRunMessage(run) });
    };
    const onUpdate = () => {
      this.renderRunsTable();
    };
    const onError = (err: Error) => {
      this.showSnackbar({
        messageHtml: `<strong>${err.name}</strong>: "${err.message}"`,
        type: "error",
        duration: errorMessageDuration,
      });
    };
    const onComplete = (run: Run) => {
      this.showSnackbar({
        messageHtml: `Finished <strong>${run.name}</strong>`,
        type: "success",
      });
      this.renderRunsTable();
    };
    startRun({ run, onStart, onUpdate, onError, onComplete });
  }

  viewRun(id: string) {
    const run = db.getRuns().find((run: Run) => run.id === id);
    if (!run) {
      return;
    }
    router.goTo(`/runs/${run.id}`);
  }

  deleteRun(id: string) {
    const confirm = window.confirm("Are you sure you want to delete this run?");
    if (!confirm) {
      return;
    }
    const run = db.getRuns().find((run: Run) => run.id === id);
    if (!run) {
      return;
    }
    db.deleteRun(run);
    this.renderRunsTable();
  }

  exportRun(id: string) {
    const run = db.getRuns().find((run: Run) => run.id === id);
    if (!run) {
      return;
    }
    exportRun({ run });
  }

  makeNewRunForm(): NewRunForm {
    const datasets = db.getDatasets();
    let presets = db.getPresets();
    presets = presets.filter((preset: Preset) =>
      preset.getPrompt().hasPlaceholder()
    );
    const newRunForm = new NewRunForm({
      datasets,
      presets,
      onSubmit: (run: Run) => {
        db.createRun(run);
        run.name = `Run ${run.id}`;
        db.updateRun(run);
        this.renderRunsTable();
        this.showSnackbar({
          messageHtml: "Run created",
          type: "success",
        });
        this.newRunModal.hide();
        this.startRun(run.id);
      },
    });
    newRunForm.render();
    return newRunForm;
  }

  initListeners() {
    this.createRunButton!.addEventListener("click", () => {
      this.newRunModal.render();
      this.newRunModal.show();
    });
    this.compareButton?.addEventListener("click", () => {
      const selectedRuns = this.getSelectedRuns();
      if (selectedRuns.length > 2) {
        this.showSnackbar({
          messageHtml: "Please select at most two runs",
          type: "error",
          duration: errorMessageDuration,
        });
        return;
      }
      const run1 = selectedRuns[0];
      const run2 = selectedRuns[1];
      if (run1?.datasetId !== run2?.datasetId) {
        this.showSnackbar({
          messageHtml: "Runs must be from the same dataset",
          type: "error",
          duration: errorMessageDuration,
        });
        return;
      }
      router.goTo(`/runs/compare/${run1.id}/${run2.id}`);
    });
  }
}
