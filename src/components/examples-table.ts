import { DataTable, Column, Row } from "./datatable";
import { Component } from "./component";
import examplesTableHtml from "./examples-table.html?raw";
import examplesTableCss from "./examples-table.css?raw";
import exampleData from "../data/examples/examples.yaml?raw";
import * as yaml from "yaml";

export type Example = {
  id: string;
  name: string;
  prompt: string;
  tags: string[];
  provider: string;
  settings: any;
};

export class ExamplesTable extends Component {
  private _datatable: DataTable;
  tableContainer: HTMLDivElement = this.container.querySelector(
    ".table-container"
  ) as HTMLDivElement;
  columns: Column[];
  examples: Example[] = [];
  onLoad: (example: Example) => void;

  constructor({
    container,
    onLoad,
  }: {
    container: HTMLDivElement;
    onLoad: (example: Example) => void;
  }) {
    super({ container, html: examplesTableHtml, css: examplesTableCss });
    this.onLoad = onLoad;
    this.columns = [
      {
        name: "Name",
        key: "name",
        searchable: true,
      },
      {
        name: "Tags",
        key: "tags",
        searchable: true,
      },
      {
        name: "Provider",
        key: "provider",
        searchable: true,
      },
      {
        name: "Model",
        key: "model",
        searchable: true,
      },
      {
        name: "Actions",
        key: "actions",
        searchable: false,
      },
    ];
    this._datatable = new DataTable({
      container: this.tableContainer,
      columns: this.columns,
      rows: [],
      actions: ["search"],
    });
  }

  public render(): void {
    this.examples = yaml.parse(exampleData);
    let rows: Row[] = this.examples.map((example: any) => {
      const tagsHtml = example.tags
        .map((tag: string) => `<span class="tag">${tag}</span>`)
        .join(" ");
      const actionsHtml = `<button data-action="load" data-id="${example.name}" class="outline">Load</button>`;
      return {
        id: example.name,
        ...example,
        tags: tagsHtml,
        actions: actionsHtml,
        provider: example.provider,
        model: example.settings.model,
      };
    });
    this._datatable.updateRows(rows);
    this._datatable.render();
    this.addListeners();
  }

  private addListeners(): void {
    this.container.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.dataset.action === "load") {
        const id = target.dataset.id;
        const example = this.examples.find((example) => example.name === id);
        if (example) {
          this.onLoad(example);
        }
      }
    });
  }
}
