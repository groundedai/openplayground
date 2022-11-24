import runsViewCss from "./runs-view.css?raw";
import { Run, RunStatus } from "../types";
import { getRuns, createRun, updateRun, deleteRun } from "../db/runs";
import { getDatasets } from "../db/datasets";
import { getLanguageModelSettings } from "../db/language-model-settings";
import { getPromptTemplates } from "../db/prompt-templates";
import { getRecords } from "../db/records";
import { DataTable } from "../components/datatable";
import runsViewHtml from "./runs-view.html?raw";
import { renderTemplate } from "../util/string";
import { CohereLanguageModel } from "../providers/cohere";
import { OpenAILanguageModel } from "../providers/openai";
import { router } from "../main";
import { View } from "./view";
import { FormatResultsSettingsPanel } from "../components/format-results-settings-panel";

const providerToClass: {
  [key: string]: any;
} = {
  cohere: CohereLanguageModel,
  openai: OpenAILanguageModel,
};

const errorMessageDuration = 6000;

export class RunsView extends View {
  runsTable: DataTable | null = null;
  runsTableContainer: HTMLDivElement = document.querySelector(
    "#runs-table-container"
  ) as HTMLDivElement;
  savedSettingsContainer: HTMLDivElement = document.querySelector(
    "#saved-settings-container"
  ) as HTMLDivElement;
  newRunSelectDataset: HTMLSelectElement = document.querySelector(
    "#run-dataset"
  ) as HTMLSelectElement;
  newRunSelectTemplate: HTMLSelectElement = document.querySelector(
    "#run-template"
  ) as HTMLSelectElement;
  newRunSelectSettings: HTMLSelectElement = document.querySelector(
    "#run-settings"
  ) as HTMLSelectElement;
  newRunForm: HTMLFormElement = document.querySelector(
    "#new-run-form"
  ) as HTMLFormElement;
  compareButton: HTMLButtonElement = document.querySelector(
    "#compare-button"
  ) as HTMLButtonElement;
  formatResultsSettingsPanelContainer: HTMLDivElement = document.querySelector(
    "#format-results-settings-panel"
  ) as HTMLDivElement;
  newRunDetails: HTMLDetailsElement = document.querySelector(
    "#new-run-details"
  ) as HTMLDetailsElement;
  formatResultsSettingsPanel: FormatResultsSettingsPanel;

  constructor({ container }: { container: HTMLDivElement }) {
    super({ container, html: runsViewHtml, css: runsViewCss });
    this.formatResultsSettingsPanel = new FormatResultsSettingsPanel(
      this.formatResultsSettingsPanelContainer
    );
    if (getRuns().length === 0) {
      this.newRunDetails.open = true;
    }
  }

  render() {
    this.fillSelectOptions();
    this.renderRunsTable();
    this.formatResultsSettingsPanel.render();
    this.addListeners();
  }

  fillSelectOptions() {
    const datasets = getDatasets();
    const templates = getPromptTemplates();
    const settings = getLanguageModelSettings();
    datasets.forEach((dataset) => {
      const option = document.createElement("option");
      option.value = dataset.id;
      option.innerText = dataset.name;
      this.newRunSelectDataset?.appendChild(option);
    });
    templates.forEach((template) => {
      const option = document.createElement("option");
      option.value = template.id;
      option.innerText = template.name;
      this.newRunSelectTemplate?.appendChild(option);
    });
    settings.forEach((setting) => {
      const option = document.createElement("option");
      option.value = setting.id;
      option.innerText = setting.name;
      this.newRunSelectSettings?.appendChild(option);
    });
  }

  renderRunsTable() {
    const rows = getRuns().map((run) => {
      const dataset = getDatasets().find(
        (dataset) => dataset.id === run.datasetId
      );
      const template = getPromptTemplates().find(
        (template) => template.id === run.templateId
      );
      const settings = getLanguageModelSettings().find(
        (settings) => settings.id === run.languageModelSettingsId
      );
      const nFailed = Object.values(run.results).filter(
        (result) => result.status === RunStatus.failed
      ).length;
      if (nFailed > 0) {
        run.status = RunStatus.failed;
      } else {
        run.status = RunStatus.completed;
      }
      let statusMessage = "";
      if (run.status === RunStatus.failed) {
        statusMessage = `Failed (${nFailed})`
      } else {
        statusMessage = run.status
      }
      statusMessage = statusMessage.charAt(0).toUpperCase() + statusMessage.slice(1);
      return {
        id: run.id,
        name: run.name,
        status: statusMessage,
        dataset: dataset?.name || "Not found",
        template: template?.name || "Not found",
        settings: settings?.name || "Not found",
        actions: `<button id="start-run-button" data-id="${run.id}" class="outline">Start</button> <button id="export-run-button" data-id="${run.id}" class="outline">Export</button> <button id="view-run-button" data-id="${run.id}" class="outline">View</button> <button id="delete-run-button" data-id="${run.id}" class="outline danger">Delete</button>`,
        select: `<input type="checkbox" id="select-run" data-id="${run.id}" />`,
      };
    });
    const columns = [
      { key: "select", name: "Select" },
      { key: "name", name: "Name" },
      { key: "status", name: "Status" },
      { key: "dataset", name: "Dataset" },
      { key: "template", name: "Template" },
      { key: "settings", name: "Settings" },
      { key: "actions", name: "Actions" },
    ];
    this.runsTable = new DataTable(
      this.runsTableContainer!,
      rows,
      columns,
      "No runs"
    );
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
        const run = getRuns().find((run) => run.id === runId);
        if (run) {
          selectedRuns.push(run);
        }
      }
    });
    return selectedRuns;
  }

  updateCompareButton() {
    // If two runs with the same dataset are selected, enable compare
    const selectedRuns = this.getSelectedRuns();
    if (selectedRuns.length === 2) {
      const run1 = selectedRuns[0];
      const run2 = selectedRuns[1];
      if (run1?.datasetId === run2?.datasetId) {
        this.compareButton.disabled = false;
        return;
      }
    }
    this.compareButton.disabled = true;
  }

  startRun(id: string) {
    const run = getRuns().find((run) => run.id === id);
    if (!run) {
      return;
    }
    // If run already has results, confirm
    if (run.status === RunStatus.completed) {
      const confirm = window.confirm(
        "This run has already been completed. Starting it again will overwrite the existing results. Are you sure you want to continue?"
      );
      if (!confirm) {
        return;
      }
    }
    run.results = {}; // Clear results
    run.status = RunStatus.running;
    updateRun(run);
    this.renderRunsTable();
    const dataset = getDatasets().find(
      (dataset) => dataset.id === run.datasetId
    );
    const records = getRecords().filter(
      (record) => record.datasetId === run.datasetId
    );
    const template = getPromptTemplates().find(
      (template) => template.id === run.templateId
    );
    const settings = getLanguageModelSettings().find(
      (settings) => settings.id === run.languageModelSettingsId
    );
    console.log("Starting run", run, dataset, template, settings, records);
    if (!dataset || !template || !settings) {
      return;
    }
    const langModelClass = providerToClass[settings.provider];
    // delete settings.settings.apiKey;
    const langModel = new langModelClass(settings.settings);
    console.log(langModel);
    this.runsTable!.updateCell({
      rowId: run.id,
      key: "status",
      value:
        run.status[0].toUpperCase() +
        run.status.slice(1) +
        ` (0/${records.length})`,
    });
    const promises = records.map((record) => {
      const prompt = renderTemplate(template.template, { text: record.text });
      return langModel
        .getSuggestions(prompt)
        .then((res: { data: any; text: string }) => {
          const text = res.text;
          run.results[record.id] = { text, status: RunStatus.completed };
          updateRun(run);
          const nCompleted = Object.keys(run.results).length;
          this.runsTable!.updateCell({
            rowId: run.id,
            key: "status",
            value:
              run.status[0].toUpperCase() +
              run.status.slice(1) +
              ` (${nCompleted}/${records.length})`,
          });
        })
        .catch((err: any) => {
          this.showSnackbar({
            messageHtml: `<strong>${err.name}</strong>: "${err.message}"`,
            type: "error",
            duration: errorMessageDuration,
          });
          run.results[record.id] = {
            text: err.message,
            status: RunStatus.failed,
          };
          updateRun(run);
        });
    });
    Promise.all(promises).then(() => {
      updateRun(run);
      this.renderRunsTable();
    });
  }

  viewRun(id: string) {
    const run = getRuns().find((run) => run.id === id);
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
    const run = getRuns().find((run) => run.id === id);
    if (!run) {
      return;
    }
    deleteRun(run);
    this.renderRunsTable();
  }

  exportRun(id: string) {
    const run = getRuns().find((run) => run.id === id);
    if (!run) {
      return;
    }
    const dataset = getDatasets().find(
      (dataset) => dataset.id === run.datasetId
    );
    const records = getRecords().filter(
      (record) => record.datasetId === run.datasetId
    );
    if (!dataset || !records) {
      return;
    }
    const resultsFormatted = run.getFormattedResults();
    const text = records.map((record) => {
      let result = resultsFormatted[record.id];
      result = `${record.text}${result}`;
      result = result.replace(/\\n/g, "\n");
      result = result.trimEnd();
      return result;
    });
    const blob = new Blob([text.join("\n\n---\n\n")], {
      type: "text/plain;charset=utf-8",
    });
    // Trigger download
    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.download = `${dataset.name}-${run.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  addListeners() {
    this.newRunForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const datasetId = this.newRunSelectDataset?.value;
      const templateId = this.newRunSelectTemplate?.value;
      const settingsId = this.newRunSelectSettings?.value;
      console.log(datasetId, templateId, settingsId);
      if (!datasetId || !templateId || !settingsId) {
        return;
      }
      const highestId = getRuns().reduce((acc, run) => {
        return Math.max(acc, parseInt(run.id));
      }, 0);
      const formatResultsSettings =
        this.formatResultsSettingsPanel.getSettings();
      const newRun = new Run({
        id: highestId + 1,
        datasetId: datasetId,
        templateId,
        languageModelSettingsId: settingsId,
        stripInitialWhiteSpace: formatResultsSettings.stripInitialWhiteSpace,
        injectStartText: formatResultsSettings.injectStartText,
        stripEndText: formatResultsSettings.stripEndText,
      });
      createRun(newRun);
      this.renderRunsTable();
    });
    this.compareButton?.addEventListener("click", () => {
      const selectedRuns = this.getSelectedRuns();
      const run1 = selectedRuns[0];
      const run2 = selectedRuns[1];
      router.goTo(`/runs/compare/${run1.id}/${run2.id}`);
    });
  }
}
