import { Project, Data, Record } from "../types";
import projectViewHTML from "./project-view.html?raw";
import { getData, createData } from "../db/data";
import { DataTable } from "../components/datatable";
import { RecordView } from "./record-view";
import showdown from "showdown";

const mdConverter = new showdown.Converter();

export class ProjectView {
  container: HTMLDivElement;
  project: Project;
  data: Data | null = null;

  constructor(container: HTMLDivElement, project: Project) {
    this.container = container;
    this.project = project;
  }

  render() {
    this.data = getData().find((d: Data) => d.project?.id === this.project.id);
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
    if (this.data) {
      const dataItemsDiv = document.getElementById(
        "data-items"
      ) as HTMLDivElement;
      dataItemsDiv.innerHTML = "";
      const columns = [
        { name: "ID", key: "id" },
        { name: "Text", key: "text" },
      ];
      const rows = this.data.records.map((d) => {
        let text = d.text.replace(/(\r\n|\n|\r)/gm, " ");
        text = mdConverter.makeHtml(text);
        return { id: d.id, text: text };
      });
      const rowClicked = (row: any) => {
        console.log("Row clicked", row);
        const record = this.data?.records.find((r) => r.id === row.id);
        if (record) {
          const recordView = new RecordView(this.container, record);
          recordView.render();
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
            const dataObject = this.parseRecords(dataString, separator);
            console.log("Data uploaded", dataObject);
            createData(dataObject);
            this.render();
          }
        };
        reader.readAsText(dataFile);
      }
    });
  }

  parseRecords(data: string, separator: string): Data {
    let dataLines = data.split(separator);
    dataLines = dataLines.map((line) => {
      return line.trim();
    });
    dataLines = dataLines.filter((line) => {
      return line.length > 0;
    });
    const records = dataLines.map((line) => {
      return new Record({ text: line });
    });
    const dataObject = new Data({
      project: this.project,
      records: records,
    });
    return dataObject;
  }
}
