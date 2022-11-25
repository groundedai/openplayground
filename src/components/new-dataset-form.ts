import { Component } from "./component";
import newDatasetFormHtml from "./new-dataset-form.html?raw";
import { Dataset, Record } from "../types";
import { createDataset } from "../db/datasets";
import { createRecord } from "../db/records";

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
      const name = formData.get("name") as string;
      const dataset = new Dataset({ name });
      createDataset(dataset);
      const dataFile = formData.get("data-file") as File;
      const data = dataFile.text();
      data.then((data) => {
        if (!data) {
          this.onSubmit(dataset);
          return;
        } else {
          const separator = (
            document.getElementById("data-separator") as HTMLInputElement
          ).value;
          const dataString = data.toString();
          const records = this.parseRecords(dataString, separator);
          records.forEach((record) => {
            record.datasetId = dataset.id;
            createRecord(record);
          });
          this.onSubmit(dataset);
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
