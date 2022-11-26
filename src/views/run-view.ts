import runViewCss from "./run-view.css?raw";
import runViewHtml from "./run-view.html?raw";
import { newlinesToBreaks } from "../util/string";
import { getRecords } from "../db/records";
import { Run, ResultStatus } from "../types";
import { titleCase } from "../util/string";
import { DataTable } from "../components/datatable";
import { View } from "./view";
import { updateRun } from "../db/runs";
import { FormatResultsSettingsPanel } from "../components/format-results-settings-panel";
import { startRun, exportRun } from "../runs";
import { errorMessageDuration } from "../globals";

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
  startButton: HTMLButtonElement = document.querySelector(
    "#start-button"
  ) as HTMLButtonElement;
  exportButton: HTMLButtonElement = document.querySelector(
    "#export-button"
  ) as HTMLButtonElement;
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
    const runStatus = run.getStatus();
    const props = {
      runName: run.name,
      status: runStatus.status,
      statusTitle: titleCase(runStatus.status),
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
      const result = resultsFormatted[record.id];
      let resultText = "[No result]";
      let resultStatus = ResultStatus.pending;
      if (result !== undefined) {
        resultText = resultsFormatted[record.id].text;
        resultStatus = resultsFormatted[record.id].status;
      }
      let resultHtml = `${text}<span class="completion ${resultStatus}">${resultText}</span>`;
      resultHtml = newlinesToBreaks(resultHtml);
      return {
        id: record.id,
        result: resultHtml,
      };
    });
    const datatable = new DataTable(
      this.recordsTableContainer!,
      rows,
      columns,
      "No records found"
    );
    datatable.render();
  }

  startRun() {
    this.showSnackbar({
      messageHtml: `Starting <strong>${this.run.name}</strong>`,
    });
    const onUpdate = () => {
      this.renderRecordsTable();
    };
    const onError = (err: Error) => {
      this.showSnackbar({
        messageHtml: `<strong>${err.name}</strong>: "${err.message}"`,
        type: "error",
        duration: errorMessageDuration,
      });
    };
    const onComplete = (run: Run) => {
      this.showSnackbar({
        messageHtml: `Finished <strong>${run.name}</strong>`,
        type: "success",
      });
      this.renderRecordsTable();
    };
    startRun({ run: this.run, onUpdate, onError, onComplete });
  }

  addListeners() {
    this.formatResultsSettingsPanel.on("settings-change", () => {
      const settings = this.formatResultsSettingsPanel.getSettings();
      this.run.insertPromptTailBeforeResult =
        settings.insertPromptTailBeforeResult;
      this.run.stripInitialWhiteSpace = settings.stripInitialWhiteSpace;
      this.run.injectStartText = settings.injectStartText;
      this.run.stripEndText = settings.stripEndText;
      updateRun(this.run);
      this.renderRecordsTable();
    });
    this.startButton.addEventListener("click", () => {
      this.startRun();
    });
    this.exportButton.addEventListener("click", () => {
      exportRun({ run: this.run });
    });
  }
}
