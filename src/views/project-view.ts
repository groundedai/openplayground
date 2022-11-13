import { Project, Record } from "../types";
import projectViewHTML from "./project-view.html?raw";
import { getRecords, createRecord } from "../db/records";
import { DataTable } from "../components/datatable";
import { router } from "../main";
import showdown from "showdown";

const mdConverter = new showdown.Converter();

export class ProjectView {
  container: HTMLDivElement;
  project: Project;
  records: Array<Record> = [];

  constructor(container: HTMLDivElement, project: Project) {
    this.container = container;
    this.project = project;
  }

  render() {
    console.log(getRecords());
    this.records = getRecords().filter((r: Record) => {
      return r.projectId === this.project.id;
    });
    const html = projectViewHTML;
    const props: { [key: string]: string } = {
      projectName: this.project.name,
    };
    let htmlWithProps = html;
    for (const key in props) {
      const value = props[key];
      const re = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      htmlWithProps = htmlWithProps.replace(re, value);
    }
    this.container.innerHTML = htmlWithProps;
    if (this.records) {
      const dataItemsDiv = document.getElementById(
        "data-items"
      ) as HTMLDivElement;
      dataItemsDiv.innerHTML = "";
      const columns = [
        { name: "ID", key: "id" },
        { name: "Text", key: "text" },
      ];
      const rows = this.records.map((d) => {
        let text = d.text.replace(/(\r\n|\n|\r)/gm, " ");
        text = mdConverter.makeHtml(text);
        return { id: d.id, text: text };
      });
      const rowClicked = (row: any) => {
        console.log("Row clicked", row);
        const record = this.records.find((r) => r.id === row.id);
        if (record) {
          router.goTo(`/${this.project.id}/record/${record.id}`);
        }
      };
      const dataTable = new DataTable(dataItemsDiv, rows, columns, rowClicked);
      dataTable.render();
    }
    this.addListeners();
  }

  addListeners() {
    const newDataForm = document.getElementById(
      "new-data-form"
    ) as HTMLFormElement;
    newDataForm.addEventListener("submit", (e: Event) => {
      e.preventDefault();
      const dataFile = (
        document.getElementById("data-file") as HTMLInputElement
      ).files?.[0];
      if (dataFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result;
          if (data) {
            const separator = (
              document.getElementById("data-separator") as HTMLInputElement
            ).value;
            const dataString = data.toString();
            const records = this.parseRecords(dataString, separator);
            console.log("Data uploaded", records);
            records.forEach((record) => {
              createRecord(record);
            });
            this.render();
          }
        };
        reader.readAsText(dataFile);
      }
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
      return new Record({ text: record, projectId: this.project.id });
    });
    return recordObjs;
  }
}
