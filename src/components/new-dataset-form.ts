import { Component } from "./component";
import newDatasetFormHtml from "./new-dataset-form.html?raw";
import { Dataset, Record } from "../types";
import { createDataset } from "../db/datasets";
import { createRecord } from "../db/records";

const datasetFileMaxSizeKb = 500;
const datasetFileMaxRecords = 100;

export class NewDatasetForm extends Component {
  form: HTMLFormElement = this.container.querySelector(
    "#form"
  ) as HTMLFormElement;
  nameInput: HTMLInputElement = this.container.querySelector(
    "#name"
  ) as HTMLInputElement;
  submitButton: HTMLButtonElement = this.container.querySelector(
    "button[type=submit]"
  ) as HTMLButtonElement;
  onSubmit: (dataset: Dataset) => void;

  constructor({ onSubmit }: { onSubmit: (dataset: Dataset) => void }) {
    const newDatasetForm = document.createElement("div");
    newDatasetForm.innerHTML = newDatasetFormHtml;
    super({ container: newDatasetForm });
    this.onSubmit = onSubmit;
    this.initListeners();
  }

  initListeners() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(this.form);
      const dataFile = formData.get("data-file") as File;
      let kbSize = dataFile.size / 1024;
      let kbSizeRounded = Math.round(kbSize * 100) / 100;
      if (kbSize > datasetFileMaxSizeKb) {
        this.showSnackbar({
          messageHtml: `File must be less than <strong>${datasetFileMaxSizeKb}KB</strong>. Yours is <strong>${kbSizeRounded}KB</strong>.`,
          type: "error",
        });
        return;
      }
      const name = formData.get("name") as string;
      const dataset = new Dataset({ name });
      const data = dataFile.text();
      data.then((data) => {
        if (data) {
          const separator = (
            document.getElementById("data-separator") as HTMLInputElement
          ).value;
          const dataString = data.toString();
          const records = this.parseRecords(dataString, separator);
          if (records.length > datasetFileMaxRecords) {
            this.showSnackbar({
              messageHtml: `File must have less than <strong>${datasetFileMaxRecords}</strong> records. Yours has <strong>${records.length}</strong> records.`,
              type: "error",
            });
            return;
          } else {
            createDataset(dataset);
            records.forEach((record) => {
              record.datasetId = dataset.id;
              createRecord(record);
            });
            this.onSubmit(dataset);
          }
        }
      });
    });
    this.nameInput.addEventListener("input", () => {
      console.log("input");
      this.submitButton.disabled = !this.nameInput.value;
    });
  }

  parseRecords(data: string, separator: string): Array<Record> {
    let records = data.split(separator);
    records = records.map((record) => {
      return record.trim();
    });
    records = records.filter((record) => {
      return record.length > 0;
    });
    const recordObjs = records.map((record) => {
      return new Record({ text: record });
    });
    return recordObjs;
  }
}
