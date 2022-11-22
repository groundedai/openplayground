import { Record } from "../types";
import recordViewHtml from "./record-view.html?raw";
import { autosizeTextarea } from "../util/dom";
import { getRecords, updateRecord } from "../db/records";
import { router } from "../main";
import { mdToHtml } from "../util/markdown";
import { View } from "./view";

export class RecordView extends View {
  record: Record;
  recordTextArea: HTMLTextAreaElement = this.container.querySelector(
    "#record-text-area"
  ) as HTMLTextAreaElement;
  previewContainer: HTMLDivElement = this.container.querySelector(
    "#preview-content"
  ) as HTMLDivElement;
  saveButton: HTMLButtonElement = this.container.querySelector(
    "#save-button"
  ) as HTMLButtonElement;
  deleteButton: HTMLButtonElement = this.container.querySelector(
    "#delete-button"
  ) as HTMLButtonElement;
  nextButton: HTMLButtonElement = this.container.querySelector(
    "#next-button"
  ) as HTMLButtonElement;
  prevButton: HTMLButtonElement = this.container.querySelector(
    "#prev-button"
  ) as HTMLButtonElement;
  backToDatasetButton: HTMLButtonElement = this.container.querySelector(
    "#back-to-dataset-button"
  ) as HTMLButtonElement;

  constructor({
    container,
    record,
  }: {
    container: HTMLDivElement;
    record: Record;
  }) {
    const props = {
      recordText: record.text,
    };
    super({ container, html: recordViewHtml, props });
    this.record = record;
  }

  render() {
    this.recordTextArea.hidden = true;
    this.recordTextArea.value = this.record.text;
    autosizeTextarea(this.recordTextArea);
    this.addListeners();
    this.makePreview();
  }

  addListeners() {
    this.recordTextArea?.addEventListener("input", (e: Event) => {
      const target = e.target as HTMLTextAreaElement;
      autosizeTextarea(target);
      this.makePreview();
    });
    this.recordTextArea.addEventListener("blur", () => {
      if (this.recordTextArea) {
        this.recordTextArea.hidden = true;
        this.previewContainer.hidden = false;
      }
    });
    this.previewContainer?.addEventListener("click", () => {
      this.previewContainer.hidden = true;
      this.recordTextArea.hidden = false;
      this.recordTextArea.focus();
      autosizeTextarea(this.recordTextArea);
    });
    this.saveButton?.addEventListener("click", (e: Event) => {
      e.preventDefault();
      const prompt = this.recordTextArea?.value;
      if (prompt) {
        this.record.text = prompt;
        updateRecord(this.record);
        console.log("saved record", this.record);
      }
    });
    this.nextButton?.addEventListener("click", (e: Event) => {
      e.preventDefault();
      let records = getRecords().filter(
        (r) => r.datasetId === this.record.datasetId
      );
      let foundCurrentRecord = false;
      let nextRecord: Record;
      records.forEach((record) => {
        if (record.id === this.record.id) {
          foundCurrentRecord = true;
        } else if (foundCurrentRecord) {
          nextRecord = record;
          foundCurrentRecord = false; // stop loop
        }
      });
      if (nextRecord!) {
        console.log("next record", nextRecord);
        router.goTo(
          `/datasets/${this.record.datasetId}/record/${nextRecord.id}`
        );
      }
    });
    this.prevButton?.addEventListener("click", (e: Event) => {
      e.preventDefault();
      let prevRecord: Record;
      let foundCurrentRecord = false;
      getRecords().forEach((record: Record) => {
        if (!foundCurrentRecord) {
          if (record.id === this.record.id) {
            foundCurrentRecord = true;
          } else {
            prevRecord = record;
          }
        }
      });
      if (prevRecord!) {
        console.log("prev record", prevRecord);
        router.goTo(
          `/datasets/${this.record.datasetId}/record/${prevRecord.id}`
        );
      }
    });
    this.backToDatasetButton?.addEventListener("click", (e: Event) => {
      e.preventDefault();
      router.goTo(`/datasets/${this.record.datasetId}`);
    });
  }

  makePreview() {
    let promptText = this.recordTextArea?.value || "";
    const html = mdToHtml(promptText);
    this.previewContainer.innerHTML = html;
  }
}
