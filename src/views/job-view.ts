import "./job-view.css";
import jobViewHtml from "./job-view.html?raw";
import { renderTemplate } from "../util/string";
import { getRecords } from "../db/records";
import { getPromptTemplates } from "../db/prompt-templates";
import { Job } from "../types";
import { mdToHtml } from "../util/markdown";
import { DataTable } from "../components/datatable";
import { Modal } from "../components/modal";
import { View } from "./view";

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
    super({ container, html: jobViewHtml, props });
    this.job = job;
  }

  render() {
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
    body.innerHTML = document.createElement(
      "div"
    ).innerHTML = `<h4>Prompt</h4>${prompt}<h4>Result</h4>${result}`;
    const modal = new Modal(this.recordModalContainer!, body);
    modal.render();
    modal.show();
  }
}
