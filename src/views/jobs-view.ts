import "./jobs-view.css";
import { Job } from "../types";
import { getJobs, createJob, updateJob, deleteJob } from "../db/jobs";
import { getDatasets } from "../db/datasets";
import { getLanguageModelSettings } from "../db/language-model-settings";
import { getPromptTemplates } from "../db/prompt-templates";
import { getRecords } from "../db/records";
import { DataTable } from "../components/datatable";
import jobsViewHtml from "./jobs-view.html?raw";
import { renderTemplate } from "../util/string";
import { CohereLanguageModel } from "../providers/cohere";
import { OpenAILanguageModel } from "../providers/openai";
import { router } from "../main";
import { View } from "./view";

const providerToClass: {
  [key: string]: any;
} = {
  cohere: CohereLanguageModel,
  openai: OpenAILanguageModel,
};

export class JobsView extends View {
  jobsTable: DataTable | null = null;
  jobsTableContainer: HTMLDivElement = document.querySelector(
    "#jobs-table-container"
  ) as HTMLDivElement;
  savedSettingsContainer: HTMLDivElement = document.querySelector(
    "#saved-settings-container"
  ) as HTMLDivElement;
  newJobSelectDataset: HTMLSelectElement = document.querySelector(
    "#job-dataset"
  ) as HTMLSelectElement;
  newJobSelectTemplate: HTMLSelectElement = document.querySelector(
    "#job-template"
  ) as HTMLSelectElement;
  newJobSelectSettings: HTMLSelectElement = document.querySelector(
    "#job-settings"
  ) as HTMLSelectElement;
  newJobForm: HTMLFormElement = document.querySelector(
    "#new-job-form"
  ) as HTMLFormElement;
  compareButton: HTMLButtonElement = document.querySelector(
    "#compare-button"
  ) as HTMLButtonElement;

  constructor({ container }: { container: HTMLDivElement }) {
    super({ container, html: jobsViewHtml });
  }

  render() {
    this.fillSelectOptions();
    this.renderJobsTable();
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
      this.newJobSelectDataset?.appendChild(option);
    });
    templates.forEach((template) => {
      const option = document.createElement("option");
      option.value = template.id;
      option.innerText = template.name;
      this.newJobSelectTemplate?.appendChild(option);
    });
    settings.forEach((setting) => {
      const option = document.createElement("option");
      option.value = setting.id;
      option.innerText = setting.name;
      this.newJobSelectSettings?.appendChild(option);
    });
  }

  renderJobsTable() {
    const rows = getJobs().map((job) => {
      const dataset = getDatasets().find(
        (dataset) => dataset.id === job.datasetId
      );
      const template = getPromptTemplates().find(
        (template) => template.id === job.templateId
      );
      const settings = getLanguageModelSettings().find(
        (settings) => settings.id === job.languageModelSettingsId
      );
      return {
        id: job.id,
        name: job.name,
        status: job.status[0].toUpperCase() + job.status.slice(1),
        dataset: dataset?.name || "Not found",
        template: template?.name || "Not found",
        settings: settings?.name || "Not found",
        actions: `<button id="start-job-button" data-id="${job.id}" class="outline">Start</button> <button id="export-job-button" data-id="${job.id}" class="outline">Export</button> <button id="view-job-button" data-id="${job.id}" class="outline">View</button> <button id="delete-job-button" data-id="${job.id}" class="outline danger">Delete</button>`,
        select: `<input type="checkbox" id="select-job" data-id="${job.id}" />`,
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
    this.jobsTable = new DataTable(
      this.jobsTableContainer!,
      rows,
      columns,
      "No jobs"
    );
    this.jobsTable.render();
    this.addJobsTableListeners();
  }

  addJobsTableListeners() {
    const startJobButtons = document.querySelectorAll(
      "#start-job-button"
    ) as NodeListOf<HTMLButtonElement>;
    startJobButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.startJob(button.dataset.id!);
      });
    });
    const viewJobButtons = document.querySelectorAll(
      "#view-job-button"
    ) as NodeListOf<HTMLButtonElement>;
    viewJobButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.viewJob(button.dataset.id!);
      });
    });
    const deleteJobButtons = document.querySelectorAll(
      "#delete-job-button"
    ) as NodeListOf<HTMLButtonElement>;
    deleteJobButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.deleteJob(button.dataset.id!);
      });
    });
    const selectJobCheckboxes = document.querySelectorAll(
      "#select-job"
    ) as NodeListOf<HTMLInputElement>;
    selectJobCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.updateCompareButton();
      });
    });
    // Check boxes when clicking on cell
    const selectJobCells = document.querySelectorAll(
      "td[data-column='select']"
    ) as NodeListOf<HTMLTableCellElement>;
    selectJobCells.forEach((cell) => {
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
      "#export-job-button"
    ) as NodeListOf<HTMLButtonElement>;
    exportButtons.forEach((button) => {
      button.addEventListener("click", () => {
        console.log("Exporting job");
        const job = getJobs().find((job) => job.id === button.dataset.id);
        console.log(job);
        this.exportJob(button.dataset.id!);
      });
    });
  }

  getSelectedJobs() {
    const selectJobCheckboxes = document.querySelectorAll(
      "#select-job"
    ) as NodeListOf<HTMLInputElement>;
    const selectedJobs: Job[] = [];
    selectJobCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const jobId = checkbox.dataset.id!;
        const job = getJobs().find((job) => job.id === jobId);
        if (job) {
          selectedJobs.push(job);
        }
      }
    });
    return selectedJobs;
  }

  updateCompareButton() {
    // If two jobs with the same dataset are selected, enable compare
    const selectedJobs = this.getSelectedJobs();
    if (selectedJobs.length === 2) {
      const job1 = selectedJobs[0];
      const job2 = selectedJobs[1];
      if (job1?.datasetId === job2?.datasetId) {
        this.compareButton.disabled = false;
        return;
      }
    }
    this.compareButton.disabled = true;
  }

  startJob(id: string) {
    const job = getJobs().find((job) => job.id === id);
    if (!job) {
      return;
    }
    // If job already has results, confirm
    if (job.status === "complete") {
      const confirm = window.confirm(
        "This job has already been completed. Starting it again will overwrite the existing results. Are you sure you want to continue?"
      );
      if (!confirm) {
        return;
      }
    }
    job.results = {}; // Clear results
    job.status = "running";
    updateJob(job);
    this.renderJobsTable();
    const dataset = getDatasets().find(
      (dataset) => dataset.id === job.datasetId
    );
    const records = getRecords().filter(
      (record) => record.datasetId === job.datasetId
    );
    const template = getPromptTemplates().find(
      (template) => template.id === job.templateId
    );
    const settings = getLanguageModelSettings().find(
      (settings) => settings.id === job.languageModelSettingsId
    );
    console.log("Starting job", job, dataset, template, settings, records);
    if (!dataset || !template || !settings) {
      return;
    }
    const langModelClass = providerToClass[settings.provider];
    const langModel = new langModelClass(settings.settings);
    console.log(langModel);
    const promises = records.map((record) => {
      const prompt = renderTemplate(template.template, { text: record.text });
      return langModel
        .getSuggestions(prompt)
        .then((res: { data: any; text: string }) => {
          const text = res.text;
          job.results[record.id] = text;
          updateJob(job);
          const nCompleted = Object.keys(job.results).length;
          this.jobsTable!.updateCell({
            rowId: job.id,
            key: "status",
            value:
              job.status[0].toUpperCase() +
              job.status.slice(1) +
              ` (${nCompleted}/${records.length})`,
          });
        });
      // .catch((err: any) => {
      // this.showSnackbar({
      //   messageHtml: `<strong>${err.name}</strong>: "${err.message}"`,
      //   type: "error",
      //   duration: 4000,
      // });
      // });
    });
    Promise.all(promises)
      .then(() => {
        job.status = "complete";
        updateJob(job);
        this.renderJobsTable();
      })
      .catch((err: any) => {
        this.showSnackbar({
          messageHtml: `<strong>${err.name}</strong>: "${err.message}"`,
          type: "error",
          duration: 4000,
        });
        job.status = "failed";
        updateJob(job);
        this.renderJobsTable();
      });
  }

  viewJob(id: string) {
    const job = getJobs().find((job) => job.id === id);
    if (!job) {
      return;
    }
    router.goTo(`/jobs/${job.id}`);
  }

  deleteJob(id: string) {
    const confirm = window.confirm("Are you sure you want to delete this job?");
    if (!confirm) {
      return;
    }
    const job = getJobs().find((job) => job.id === id);
    if (!job) {
      return;
    }
    deleteJob(job);
    this.renderJobsTable();
  }

  exportJob(id: string) {
    // Trigger download of a text file containing the results separated by ---
    const job = getJobs().find((job) => job.id === id);
    if (!job) {
      return;
    }
    console.log("Exporting job", job);
    const dataset = getDatasets().find(
      (dataset) => dataset.id === job.datasetId
    );
    const records = getRecords().filter(
      (record) => record.datasetId === job.datasetId
    );
    if (!dataset || !records) {
      return;
    }
    const text = records.map((record) => {
      const result = job.results[record.id];
      return `${record.text}\n${result}`;
    });
    const blob = new Blob([text.join("\n---\n")], {
      type: "text/plain;charset=utf-8",
    });
    console.log(blob);
    // Trigger download
    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.download = `${dataset.name}-${job.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  addListeners() {
    this.newJobForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const datasetId = this.newJobSelectDataset?.value;
      const templateId = this.newJobSelectTemplate?.value;
      const settingsId = this.newJobSelectSettings?.value;
      console.log(datasetId, templateId, settingsId);
      if (!datasetId || !templateId || !settingsId) {
        return;
      }
      const highestId = getJobs().reduce((acc, job) => {
        return Math.max(acc, parseInt(job.id));
      }, 0);
      const newJob = new Job({
        id: highestId + 1,
        datasetId: datasetId,
        templateId,
        languageModelSettingsId: settingsId,
      });
      createJob(newJob);
      this.renderJobsTable();
    });
    this.compareButton?.addEventListener("click", () => {
      const selectedJobs = this.getSelectedJobs();
      const job1 = selectedJobs[0];
      const job2 = selectedJobs[1];
      router.goTo(`/jobs/compare/${job1.id}/${job2.id}`);
    });
  }
}
