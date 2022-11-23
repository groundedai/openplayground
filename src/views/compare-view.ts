import { View } from "./view";
import compareViewHtml from "./compare-view.html?raw";
import compareViewCss from "./compare-view.css?raw";
import { Job, Record, PromptTemplate, LanguageModelSettings } from "../types";
import { getDatasets } from "../db/datasets";
import { getRecords } from "../db/records";
import { getPromptTemplates } from "../db/prompt-templates";
import { getLanguageModelSettings } from "../db/language-model-settings";
import { DataTable } from "../components/datatable";
import { renderTemplate, newlinesToBreaks } from "../util/string";

export class CompareView extends View {
  jobA: Job;
  jobB: Job;
  resultsContainer: HTMLDivElement = document.querySelector(
    "#results"
  ) as HTMLDivElement;
  settingsContainer: HTMLDivElement = document.querySelector(
    "#settings"
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
      css: compareViewCss,
    });
    this.jobA = jobA;
    this.jobB = jobB;
  }

  render() {
    const dataset = getDatasets().find((d) => d.id === this.jobA.datasetId);
    const records = getRecords().filter((r) => r.datasetId === dataset.id);
    const resultsA = this.jobA.results;
    const resultsB = this.jobB.results;
    this.renderSettingsTable();
    this.renderResultsTable({ records, resultsA, resultsB });
  }

  renderSettingsTable() {
    const settingsA = getLanguageModelSettings().find(
      (s) => s.id === this.jobA.languageModelSettingsId
    );
    const settingsB = getLanguageModelSettings().find(
      (s) => s.id === this.jobB.languageModelSettingsId
    );
    const templateA = getPromptTemplates().find(
      (t) => t.id === this.jobA.templateId
    );
    const templateB = getPromptTemplates().find(
      (t) => t.id === this.jobB.templateId
    );
    const renderSettingsCell = (settings: LanguageModelSettings) => {
      return `<pre>${JSON.stringify(settings.settings, null, 2)}</pre>`;
    };
    const renderTemplateCell = (template: PromptTemplate) => {
      let templateHtml = newlinesToBreaks(template.template);
      return `<pre>${templateHtml}</pre>`;
    };
    const rows = [
      {
        id: "lms-name",
        name: "Settings Name",
        valueA: `<h5><pre>${settingsA!.name}</pre></h5>`,
        valueB: `<h5><pre>${settingsB!.name}</pre></h5>`,
      },
      {
        id: "lms",
        name: "Settings",
        valueA: renderSettingsCell(settingsA!),
        valueB: renderSettingsCell(settingsB!),
      },
      {
        id: "template-name",
        name: "Template Name",
        valueA: `<h5><pre>${templateA!.name}</pre></h5>`,
        valueB: `<h5><pre>${templateB!.name}</pre></h5>`,
      },
      {
        id: "template",
        name: "Template",
        valueA: renderTemplateCell(templateA!),
        valueB: renderTemplateCell(templateB!),
      },
    ];
    const columns = [
      {
        name: "",
        key: "name",
      },
      {
        name: this.jobA.name,
        key: "valueA",
      },
      {
        name: this.jobB.name,
        key: "valueB",
      },
    ];
    const table = new DataTable(this.settingsContainer, rows, columns);
    table.render();
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
      text = `<pre>${record.text}\n\n<span class="completion">${result}</span></pre>`;
    } else {
      let prompt = renderTemplate(promptTemplate.template, {
        text: record.text,
      });
      text = `<pre>${prompt}<span class="completion">${result}</span></pre>`;
    }
    let html = newlinesToBreaks(text);
    return html;
  }
}
