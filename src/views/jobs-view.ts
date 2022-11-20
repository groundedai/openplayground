import "./jobs-view.css"
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
import { parseEnv } from "../util/env";
import env from "../../.env?raw";

const envVars = parseEnv(env);

export class JobsView {
  container: HTMLDivElement;
  jobsTable: DataTable | null = null;
  jobsTableContainer: HTMLDivElement | null = null;
  savedSettingsContainer: HTMLDivElement | null = null;
  newJobSelectDataset: HTMLSelectElement | null = null;
  newJobSelectTemplate: HTMLSelectElement | null = null;
  newJobSelectSettings: HTMLSelectElement | null = null;
  newJobForm: HTMLFormElement | null = null;

  constructor(container: HTMLDivElement) {
    this.container = container;
  }

  render() {
    this.container.innerHTML = jobsViewHtml;
    this.jobsTableContainer = document.querySelector(
      "#jobs-table-container"
    ) as HTMLDivElement;
    this.savedSettingsContainer = document.querySelector(
      "#saved-settings-container"
    ) as HTMLDivElement;
    this.newJobSelectDataset = document.querySelector(
      "#job-dataset"
    ) as HTMLSelectElement;
    this.newJobSelectTemplate = document.querySelector(
      "#job-template"
    ) as HTMLSelectElement;
    this.newJobSelectSettings = document.querySelector(
      "#job-settings"
    ) as HTMLSelectElement;
    this.newJobForm = document.querySelector(
      "#new-job-form"
    ) as HTMLFormElement;
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
      return {
        id: job.id,
        name: job.name,
        status: job.status[0].toUpperCase() + job.status.slice(1),
        actions: `<button id="start-job-button" data-id="${job.id}">Start</button> <button id="view-job-button" data-id="${job.id}">View</button> <button id="delete-job-button" data-id="${job.id}">Delete</button>`,
        dataset: getDatasets().find((dataset) => dataset.id === job.datasetId)
          .name,
        template: getPromptTemplates().find(
          (template) => template.id === job.templateId
        ).name,
        settings: getLanguageModelSettings().find(
          (settings) => settings.id === job.languageModelSettingsId
        )?.name,
      };
    });
    const columns = [
      { key: "id", name: "ID" },
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
    // Add listeners to the buttons
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
  }

  startJob(id: string) {
    const job = getJobs().find((job) => job.id === id);
    if (!job) {
      return;
    }
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
    let model: any;
    switch (settings.provider) {
      case "cohere":
        model = new CohereLanguageModel({
          apiKey: settings.apiKey,
          settings: settings.settings,
        });
        break;
      case "openai":
        model = new OpenAILanguageModel({
          apiKey: settings.apiKey,
          settings: settings.settings,
        });
        break;
    }
    const promises = records.map((record) => {
      const prompt = renderTemplate(template.template, { text: record.text });
      console.log("Prompt", prompt);
      return model
        .getSuggestions(prompt)
        .then((res) => {
          const text = res.text;
          console.log("Suggestion", text);
          job.results[record.id] = text;
        })
        .catch((err) => {
          console.log("Error", err);
        });
    });
    Promise.all(promises).then(() => {
      job.status = "complete";
      updateJob(job);
      this.renderJobsTable();
      console.log("Updated job", job);
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
    const job = getJobs().find((job) => job.id === id);
    if (!job) {
      return;
    }
    deleteJob(job);
    this.renderJobsTable();
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
  }
}
