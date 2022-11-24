import runViewCss from "./run-view.css?raw";
import runViewHtml from "./run-view.html?raw";
import { newlinesToBreaks } from "../util/string";
import { getRecords } from "../db/records";
import { Run } from "../types";
import { DataTable } from "../components/datatable";
import { View } from "./view";
import { updateRun } from "../db/runs";
import { FormatResultsSettingsPanel } from "../components/format-results-settings-panel";

export class RunView extends View {
  run: Run;
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
    run,
  }: {
    container: HTMLDivElement;
    run: Run | undefined;
  }) {
    if (!run) {
      throw new Error("run is undefined");
    }
    const props = {
      runName: run.name,
    };
    super({ container, html: runViewHtml, props, css: runViewCss });
    this.run = run;
    this.formatResultsSettingsPanel = new FormatResultsSettingsPanel(
      this.formatResultsSettingsPanelContainer
    );
  }

  render() {
    this.formatResultsSettingsPanel.render();
    this.formatResultsSettingsPanel.setSettings({
      stripInitialWhiteSpace: this.run.stripInitialWhiteSpace,
      injectStartText: this.run.injectStartText,
      stripEndText: this.run.stripEndText,
    });
    this.renderRecordsTable();
    this.addListeners();
  }

  renderRecordsTable() {
    const records = getRecords().filter(
      (r) => r.datasetId === this.run.datasetId
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
    const resultsFormatted = this.run.getFormattedResults();
    const rows = records.map((record: any) => {
      const text = record.text;
      let resultText = resultsFormatted[record.id].text;
      let resultStatus = resultsFormatted[record.id].status;
      let resultHtml = `${text}<span class="completion ${resultStatus}">${resultText}</span>`;
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
  //     (t) => t.id === this.run.templateId
  //   );
  //   const textFormatted = mdToHtml(record.text);
  //   const prompt = renderTemplate(template.template, {
  //     text: record.text,
  //   });
  //   const promptFormatted = mdToHtml(prompt);
  //   const result = this.run.results[record.id];
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
      this.run.stripInitialWhiteSpace = settings.stripInitialWhiteSpace;
      this.run.injectStartText = settings.injectStartText;
      this.run.stripEndText = settings.stripEndText;
      updateRun(this.run);
      this.renderRecordsTable();
    });
  }
}
