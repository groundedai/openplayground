import { View } from "./view";
import compareViewHtml from "./compare-view.html?raw";
import compareViewCss from "./compare-view.css?raw";
import {
  Run,
  Record,
  Prompt,
  LanguageModelSettings,
  Result,
  Dataset,
} from "../types";
import { db } from "../db";
import { DataTable } from "../components/datatable";
import { renderTemplate, newlinesToBreaks } from "../util/string";

export class CompareView extends View {
  runA: Run;
  runB: Run;
  resultsContainer: HTMLDivElement = document.querySelector(
    "#results"
  ) as HTMLDivElement;
  settingsContainer: HTMLDivElement = document.querySelector(
    "#settings"
  ) as HTMLDivElement;
  showFullPrompt: boolean = false;

  constructor({
    container,
    runA,
    runB,
  }: {
    container: HTMLDivElement;
    runA: Run | undefined;
    runB: Run | undefined;
  }) {
    if (!runA) {
      throw new Error("run A is undefined");
    }
    if (!runB) {
      throw new Error("run B is undefined");
    }
    const props = {
      runAName: runA.name,
      runBName: runB.name,
    };
    super({
      container,
      html: compareViewHtml,
      props,
      css: compareViewCss,
    });
    this.runA = runA;
    this.runB = runB;
  }

  render() {
    const dataset = db.getDatasets().find((d: Dataset) => d.id === this.runA.datasetId);
    const records = getRecords().filter((r) => r.datasetId === dataset.id);
    const resultsA = this.runA.formatResults();
    const resultsB = this.runB.formatResults();
    this.renderSettingsTable();
    this.renderResultsTable({ records, resultsA, resultsB });
  }

  renderSettingsTable() {
    const settingsA = getLanguageModelSettings().find(
      (s) => s.id === this.runA.languageModelSettingsId
    );
    const settingsB = getLanguageModelSettings().find(
      (s) => s.id === this.runB.languageModelSettingsId
    );
    const templateA = getPromptTemplates().find(
      (t) => t.id === this.runA.templateId
    );
    const templateB = getPromptTemplates().find(
      (t) => t.id === this.runB.templateId
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
        name: this.runA.name,
        key: "valueA",
      },
      {
        name: this.runB.name,
        key: "valueB",
      },
    ];
    const table = new DataTable({
      container: this.settingsContainer,
      rows,
      columns,
    });
    table.render();
  }

  renderResultsTable({
    records,
    resultsA,
    resultsB,
  }: {
    records: Record[];
    resultsA: { [key: string]: Result };
    resultsB: { [key: string]: Result };
  }) {
    const rows = records.map((record) => {
      const resultA = resultsA[record.id as string];
      const resultB = resultsB[record.id as string];
      const resultAHtml = this.makeResultHtml({
        record,
        result: resultA,
      });
      const resultBHtml = this.makeResultHtml({
        record,
        result: resultB,
      });
      return {
        id: record.id!,
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
        name: this.runA.name,
      },
      {
        key: "resultB",
        name: this.runB.name,
      },
    ];
    const table = new DataTable({
      container: this.resultsContainer,
      rows,
      columns,
    });
    table.render();
  }

  makeResultHtml({
    record,
    result,
    promptTemplate,
  }: {
    record: Record;
    result: Result;
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
