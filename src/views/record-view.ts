import { Record } from "../types";
import recordViewHtml from "./record-view.html?raw";
import { autosizeTextarea } from "../util/dom";
import { getRecords, updateRecord } from "../db/records";
import { router } from "../main";
import { mdToHtml } from "../util/markdown";
import { renderTemplate } from "../util/string";

export class RecordView {
  container: HTMLDivElement;
  record: Record;
  recordTextArea!: HTMLTextAreaElement;
  previewContainer!: HTMLDivElement;
  saveButton: HTMLButtonElement | null = null;
  deleteButton: HTMLButtonElement | null = null;
  nextButton: HTMLButtonElement | null = null;
  prevButton: HTMLButtonElement | null = null;
  backToDatasetButton: HTMLButtonElement | null = null;

  constructor(container: HTMLDivElement, record: Record) {
    this.container = container;
    this.record = record;
  }

  render() {
    const html = recordViewHtml;
    const props: any = {
      recordText: this.record.text,
    };
    let htmlWithProps = renderTemplate(html, props);
    this.container.innerHTML = htmlWithProps;
    this.recordTextArea = this.container.querySelector(
      "#record-text-area"
    ) as HTMLTextAreaElement;
    this.recordTextArea.hidden = true;
    this.recordTextArea.value = this.record.text;
    autosizeTextarea(this.recordTextArea);
    this.previewContainer = this.container.querySelector(
      "#preview-content"
    ) as HTMLDivElement;
    this.saveButton = this.container.querySelector(
      "#save-button"
    ) as HTMLButtonElement;
    this.deleteButton = this.container.querySelector(
      "#delete-button"
    ) as HTMLButtonElement;
    this.nextButton = this.container.querySelector(
      "#next-button"
    ) as HTMLButtonElement;
    this.prevButton = this.container.querySelector(
      "#prev-button"
    ) as HTMLButtonElement;
    this.backToDatasetButton = this.container.querySelector(
      "#back-to-dataset-button"
    ) as HTMLButtonElement;
    this.addListeners();
    this.makePreview();
  }

  addListeners() {
    this.recordTextArea?.addEventListener("input", (e: Event) => {
      const target = e.target as HTMLTextAreaElement;
      autosizeTextarea(target);
      this.makePreview();
    });
    this.recordTextArea.addEventListener("blur", (e: Event) => {
      if (this.recordTextArea) {
        this.recordTextArea.hidden = true;
        this.previewContainer.hidden = false;
      }
    });
    this.previewContainer?.addEventListener("click", (e: Event) => {
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
      let nextRecord: Record | null = null;
      records.forEach((record) => {
        if (record.id === this.record.id) {
          foundCurrentRecord = true;
        } else if (foundCurrentRecord) {
          nextRecord = record;
          foundCurrentRecord = false; // stop loop
        }
      });
      console.log("next record", nextRecord);
      if (nextRecord) {
        router.goTo(
          `/datasets/${this.record.datasetId}/record/${nextRecord.id}`
        );
      }
    });
    this.prevButton?.addEventListener("click", (e: Event) => {
      e.preventDefault();
      let prevRecord: Record | null = null;
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
      console.log("prev record", prevRecord);
      if (prevRecord) {
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
