import jobViewCss from "./job-view.css?raw";
import jobViewHtml from "./job-view.html?raw";
import { newlinesToBreaks, renderTemplate } from "../util/string";
import { getRecords } from "../db/records";
import { getPromptTemplates } from "../db/prompt-templates";
import { Job } from "../types";
import { mdToHtml } from "../util/markdown";
import { DataTable } from "../components/datatable";
import { Modal } from "../components/modal";
import { View } from "./view";
import { updateJob } from "../db/jobs";
import {
  FormatResultsSettingsPanel,
  FormatResultsSettings,
} from "../components/format-results-settings-panel";

export class JobView extends View {
  job: Job;
  recordsContainer: HTMLDivElement = document.querySelector(
    "#records"
  ) as HTMLDivElement;
  recordsTableContainer: HTMLDivElement = document.querySelector(
    "#records-table"
  ) as HTMLDivElement;
  recordModalContainer: HTMLDivElement = document.querySelector(
    "#record-modal"
  ) as HTMLDivElement;
  formatResultsSettingsPanelContainer: HTMLDivElement = document.querySelector(
    "#format-results-settings-panel"
  ) as HTMLDivElement;
  formatResultsSettingsPanel: FormatResultsSettingsPanel;

  constructor({
    container,
    job,
  }: {
    container: HTMLDivElement;
    job: Job | undefined;
  }) {
    if (!job) {
      throw new Error("Job is undefined");
    }
    const props = {
      jobName: job.name,
    };
    super({ container, html: jobViewHtml, props, css: jobViewCss });
    this.job = job;
    this.formatResultsSettingsPanel = new FormatResultsSettingsPanel(
      this.formatResultsSettingsPanelContainer
    );
  }

  render() {
    this.formatResultsSettingsPanel.render();
    this.formatResultsSettingsPanel.setSettings({
      stripInitialWhiteSpace: this.job.stripInitialWhiteSpace,
      injectStartText: this.job.injectStartText,
      stripEndText: this.job.stripEndText,
    });
    this.renderRecordsTable();
    this.addListeners();
  }

  renderRecordsTable() {
    const records = getRecords().filter(
      (r) => r.datasetId === this.job.datasetId
    );
    const columns = [
      {
        key: "id",
        name: "ID",
      },
      {
        key: "result",
        name: "Result",
      },
    ];
    const resultsFormatted = this.job.getFormattedResults();
    const rows = records.map((record: any) => {
      const text = record.text;
      let resultFormatted = resultsFormatted[record.id];
      let resultHtml = `${text}\n\n<span class="completion">${resultFormatted}</span>`;
      resultHtml = newlinesToBreaks(resultHtml);
      return {
        id: record.id,
        result: resultHtml,
      };
    });
    // const rowClicked = (row: any) => {
    //   const record = records.find((r: any) => r.id === row.id);
    //   this.renderRecordModal(record);
    // };
    const datatable = new DataTable(
      this.recordsTableContainer!,
      rows,
      columns,
      "No records found"
      // rowClicked
    );
    datatable.render();
  }

  // renderRecordModal(record: any) {
  //   const template = getPromptTemplates().find(
  //     (t) => t.id === this.job.templateId
  //   );
  //   const textFormatted = mdToHtml(record.text);
  //   const prompt = renderTemplate(template.template, {
  //     text: record.text,
  //   });
  //   const promptFormatted = mdToHtml(prompt);
  //   const result = this.job.results[record.id];
  //   const resultFormatted = mdToHtml(result);
  //   const promptWithResult = `${prompt}${result}`;
  //   const promptWithResultFormatted = `${promptFormatted}${resultFormatted}`;
  //   const body: HTMLDivElement = document.createElement("div");
  //   body.innerHTML = document.createElement(
  //     "div"
  //   ).innerHTML = `<h4>Prompt</h4>${prompt}<h4>Result</h4>${result}`;
  //   const modal = new Modal(this.recordModalContainer!, body);
  //   modal.render();
  //   modal.show();
  // }

  addListeners() {
    this.formatResultsSettingsPanel.on("settings-change", () => {
      const settings = this.formatResultsSettingsPanel.getSettings();
      this.job.stripInitialWhiteSpace = settings.stripInitialWhiteSpace;
      this.job.injectStartText = settings.injectStartText;
      this.job.stripEndText = settings.stripEndText;
      updateJob(this.job);
      this.renderRecordsTable();
    });
  }
}
