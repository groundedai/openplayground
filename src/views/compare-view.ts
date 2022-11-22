import { View } from "./view";
import compareViewHtml from "./compare-view.html?raw";
import "./compare-view.css";
import { Job, Record, PromptTemplate } from "../types";
import { getDatasets } from "../db/datasets";
import { getRecords } from "../db/records";
import { getPromptTemplates } from "../db/prompt-templates";
import { DataTable } from "../components/datatable";
import { renderTemplate, newlinesToBreaks } from "../util/string";

export class CompareView extends View {
  jobA: Job;
  jobB: Job;
  resultsContainer: HTMLDivElement = document.querySelector(
    "#results"
  ) as HTMLDivElement;
  showFullPrompt: boolean = false;

  constructor({
    container,
    jobA,
    jobB,
  }: {
    container: HTMLDivElement;
    jobA: Job | undefined;
    jobB: Job | undefined;
  }) {
    if (!jobA) {
      throw new Error("Job A is undefined");
    }
    if (!jobB) {
      throw new Error("Job B is undefined");
    }
    const props = {
      jobAName: jobA.name,
      jobBName: jobB.name,
    };
    super({
      container,
      html: compareViewHtml,
      props,
    });
    this.jobA = jobA;
    this.jobB = jobB;
  }

  render() {
    const dataset = getDatasets().find((d) => d.id === this.jobA.datasetId);
    const records = getRecords().filter((r) => r.datasetId === dataset.id);
    const resultsA = this.jobA.results;
    const resultsB = this.jobB.results;
    this.renderResultsTable({ records, resultsA, resultsB });
  }

  renderResultsTable({
    records,
    resultsA,
    resultsB,
  }: {
    records: Record[];
    resultsA: { [key: string]: string };
    resultsB: { [key: string]: string };
  }) {
    const rows = records.map((record) => {
      const resultA = resultsA[record.id];
      const resultB = resultsB[record.id];
      const resultAHtml = this.makeResultHtml({
        record,
        result: resultA,
      });
      const resultBHtml = this.makeResultHtml({
        record,
        result: resultB,
      });
      return {
        id: record.id,
        resultA: resultAHtml,
        resultB: resultBHtml,
      };
    });
    const columns = [
      {
        key: "id",
        name: "ID",
      },
      {
        key: "resultA",
        name: this.jobA.name,
      },
      {
        key: "resultB",
        name: this.jobB.name,
      },
    ];
    const table = new DataTable(this.resultsContainer, rows, columns);
    table.render();
  }

  makeResultHtml({
    record,
    result,
    promptTemplate,
  }: {
    record: Record;
    result: string;
    promptTemplate?: PromptTemplate;
  }): string {
    let text: string;
    if (!promptTemplate) {
      text = `${record.text}\n\n<span class="completion">${result}</span>`;
    } else {
      let prompt = renderTemplate(promptTemplate.template, {
        text: record.text,
      });
      text = `${prompt}<span class="completion">${result}</span>`;
    }
    let html = newlinesToBreaks(text);
    return html;
  }
}
