import runViewCss from "./run-view.css?raw";
import runViewHtml from "./run-view.html?raw";
import { newlinesToBreaks } from "../util/string";
import { db } from "../main";
import { Run, ResultStatus, Record } from "../types";
import { titleCase } from "../util/string";
import { DataTable } from "../components/datatable";
import { View } from "./view";
import { FormatResultsSettingsPanel } from "../components/format-results-settings-panel";
import { startRun, exportRun, makeStartingRunMessage } from "../runs";
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
  statusBox: HTMLSpanElement = document.querySelector(
    "#status"
  ) as HTMLSpanElement;
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
    const props = { runName: run.name };
    super({ container, html: runViewHtml, props, css: runViewCss });
    this.run = run;
    this.formatResultsSettingsPanel = new FormatResultsSettingsPanel(
      this.formatResultsSettingsPanelContainer
    );
    console.log(this.run)
  }

  render() {
    this.formatResultsSettingsPanel.render();
    const resultFormattingSettings = this.run.resultFormattingSettings;
    this.formatResultsSettingsPanel.setSettings(resultFormattingSettings);
    this.updateStatus();
    this.renderRecordsTable();
    this.addListeners();
  }

  updateStatus() {
    const runStatus = this.run.getStatus();
    this.statusBox.innerText = titleCase(runStatus.status);
    this.statusBox.dataset.value = runStatus.status;
  }

  renderRecordsTable() {
    const records = db
      .getRecords()
      .filter((r: Record) => r.datasetId === this.run.datasetId);
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
    const resultsFormatted = this.run.formatResults();
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
    const datatable = new DataTable({
      container: this.recordsTableContainer,
      columns,
      rows,
      emptyMessage: "No records",
    });
    datatable.render();
  }

  startRun() {
    this.showSnackbar({ messageHtml: makeStartingRunMessage(this.run) });
    const onUpdate = () => {
      this.updateStatus();
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
    this.formatResultsSettingsPanel.on("change", () => {
      const settings = this.formatResultsSettingsPanel.getSettings();
      this.run.resultFormattingSettings = settings;
      db.updateRun(this.run);
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
