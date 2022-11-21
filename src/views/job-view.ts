import "./job-view.css"
import jobViewHtml from "./job-view.html?raw";
import { renderTemplate } from "../util/string";
import { getRecords } from "../db/records";
import { getPromptTemplates } from "../db/prompt-templates";
import { Job } from "../types";
import { mdToHtml } from "../util/markdown";
import { DataTable } from "../components/datatable";
import { Modal } from "../components/modal";

export class JobView {
  container: HTMLDivElement;
  job: Job;
  recordsContainer: HTMLDivElement | null = null;
  recordsTableContainer: HTMLDivElement | null = null;
  recordModalContainer: HTMLDivElement | null = null;

  constructor(container: HTMLDivElement, job: Job) {
    this.container = container;
    this.job = job;
  }

  render() {
    this.container.innerHTML = renderTemplate(jobViewHtml, {
      jobName: this.job.name,
    });
    this.recordsContainer = document.querySelector(
      "#records"
    ) as HTMLDivElement;
    this.recordsTableContainer = document.querySelector(
      "#records-table"
    ) as HTMLDivElement;
    this.recordModalContainer = document.querySelector(
      "#record-modal"
    ) as HTMLDivElement;
    this.renderRecordsTable();
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
        key: "text",
        name: "Text",
      },
      {
        key: "result",
        name: "Result",
      },
    ];
    const rows = records.map((record: any) => {
      // Replace newlines or breaks in the text with a space
      const text = record.text;
      const result = this.job.results[record.id];
      // const text = record.text.replace(/(\r\n|\n|\r)/gm, " ");
      // const textFormatted = mdToHtml(text);
      // let result = this.job.results[record.id];
      // let resultFormatted = "";
      // if (result) {
      //   result = result.replace(/(\r\n|\n|\r)/gm, " ");
      //   resultFormatted = mdToHtml(result);
      // }
      return {
        id: record.id,
        text: text,
        result: result,
      };
    });
    const rowClicked = (row: any) => {
      const record = records.find((r: any) => r.id === row.id);
      this.renderRecordModal(record);
    };
    const datatable = new DataTable(
      this.recordsTableContainer!,
      rows,
      columns,
      "No records found",
      rowClicked
    );
    datatable.render();
  }

  renderRecordModal(record: any) {
    const template = getPromptTemplates().find(
      (t) => t.id === this.job.templateId
    );
    const textFormatted = mdToHtml(record.text);
    const prompt = renderTemplate(template.template, {
      text: record.text,
    });
    const promptFormatted = mdToHtml(prompt);
    const result = this.job.results[record.id];
    const resultFormatted = mdToHtml(result);
    const promptWithResult = `${prompt}${result}`;
    const promptWithResultFormatted = `${promptFormatted}${resultFormatted}`;
    const body: HTMLDivElement = document.createElement("div");
    // body.innerHTML = `
    //   <details><summary class="h4">Text</summary>
    //   <details><summary class="h5">Raw</summary>${record.text}</details>
    //   <details><summary class="h5">Markdown</summary>${textFormatted}</details>
    //   </details>
    //   <details><summary class="h4">Prompt</summary>
    //   <details><summary class="h5">Raw</summary>${prompt}</details>
    //   <details><summary class="h5">Markdown</summary>${promptFormatted}</details>
    //   </details>
    //   <details><summary class="h4">Result</summary>
    //   <details><summary class="h5">Raw</summary>${result}</details>
    //   <details><summary class="h5">Markdown</summary>${resultFormatted}</details>
    //   </details>
    //   <details><summary class="h4">Prompt + Result</summary>
    //   <details><summary class="h5">Raw</summary>${promptWithResult}</details>
    //   <details><summary class="h5">Markdown</summary>${promptWithResultFormatted}</details>
    //   </details>
    //     `;
    body.innerHTML = document.createElement(
      "div"
    ).innerHTML = `<h4>Prompt</h4>${prompt}<h4>Result</h4>${result}`;
    const modal = new Modal(this.recordModalContainer!, body);
    modal.render();
    modal.show();
  }
}
