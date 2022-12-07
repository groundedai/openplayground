import { Component } from "./component";
import newDatasetFormHtml from "./new-dataset-form.html?raw";
import newDatasetFormCss from "./new-dataset-form.css?raw";
import { Dataset, Record } from "../types";
import { createDataset } from "../db/datasets";
import { createRecord } from "../db/records";
import { parse } from 'csv-parse/sync';

const datasetFileMaxSizeKb = 500;
const datasetFileMaxRecords = 100;

export class NewDatasetForm extends Component {
  form: HTMLFormElement = this.container.querySelector(
    "#form"
  ) as HTMLFormElement;
  nameInput: HTMLInputElement = this.container.querySelector(
    "#dataset-name"
  ) as HTMLInputElement;
  dataFileInput: HTMLInputElement = this.container.querySelector(
    "#data-file"
  ) as HTMLInputElement;
  separatorInput: HTMLInputElement = this.container.querySelector(
    "#data-separator"
  ) as HTMLInputElement;
  separatorLabel: HTMLLabelElement = this.container.querySelector(
    "label[for=data-separator]"
  ) as HTMLLabelElement;
  submitButton: HTMLButtonElement = this.container.querySelector(
    "button[type=submit]"
  ) as HTMLButtonElement;
  onSubmit: (dataset: Dataset) => void;

  constructor({ onSubmit }: { onSubmit: (dataset: Dataset) => void }) {
    const newDatasetForm = document.createElement("div");
    newDatasetForm.innerHTML = newDatasetFormHtml;
    super({ container: newDatasetForm, css: newDatasetFormCss });
    this.onSubmit = onSubmit;
    this.initListeners();
  }

  initListeners() {
    this.dataFileInput.addEventListener("change", () => {
      if (!this.dataFileInput.files) return;
      const file = this.dataFileInput.files[0];
      if (file && (file.name.endsWith(".csv") || file.name.endsWith(".tsv"))) {
        this.separatorLabel.nodeValue = "Column";
        this.separatorInput.value = "text";
      } else {
        this.separatorLabel.nodeValue = "Separator";
        this.separatorInput.value = "---";
      }
    });

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
      const name = formData.get("dataset-name") as string;
      const dataset = new Dataset({ name });
      const data = dataFile.text();
      data.then((data) => {
        if (data) {
          const separator = this.separatorInput.value;
          const dataString = data.toString();
          const records = this.parseData(dataFile.name, dataString, separator);
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

  parseData(name: string, data: string, separator: string): Array<Record> {
    if(name.endsWith(".csv") || name.endsWith(".tsv")) {
      const delimiter = name.endsWith(".csv") ? ',' : '\t';
      const records = parse(data, {
        columns: true,
        skip_empty_lines: true,
        delimiter
      });
      return records.map((record: {[key:string]:string}) => {
        return record[separator].trim();
      }).filter((record : string) => {
        return record.length > 0;
      }).map((record: string) => {
        return new Record({ text: record });
      });
    } else {
      return this.parseRecords(data, separator);
    }
  }
}
