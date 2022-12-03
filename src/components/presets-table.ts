import { DataTable, Column, Row } from "./datatable";
import { Component } from "./component";
import presetsTableHtml from "./presets-table.html?raw";
import presetsTableCss from "./presets-table.css?raw";
// import * as yaml from "yaml"
import { Preset } from "../types";
import { Modal } from "./modal";
import { renderTemplate } from "../util/string";
import presetDetailsHtml from "./preset-details.html?raw";
import { db } from "../main";
import { getTagColor } from "../presets";

function makeTagHtml(tags: string[]) {
  return tags
    .map((tag) => {
      const color = getTagColor(tag);
      return `<span class="tag" style="background-color: var(--material-color-${color}-800)">${tag}</span>`;
    })
    .join("");
}

export class PresetsTable extends Component {
  private _datatable: DataTable;
  tableContainer: HTMLDivElement = this.container.querySelector(
    ".table-container"
  ) as HTMLDivElement;
  columns: Column[];
  onLoad: (preset: Preset) => void;
  presets: Preset[];
  detailsModal: Modal;

  constructor({
    presets,
    container,
    onLoad,
  }: {
    presets?: Preset[];
    container: HTMLDivElement;
    onLoad: (preset: Preset) => void;
  }) {
    super({ container, html: presetsTableHtml, css: presetsTableCss });
    this.presets = presets || [];
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
      emptyMessage: "No presets",
    });
    this.detailsModal = new Modal({
      title: "Preset details",
    });
  }

  public render(): void {
    // this.presets = yaml.parse(examplePresets);
    let rows: Row[] = this.presets.map((preset: any) => {
      console.log(preset.tags);
      const actionsHtml = `<button data-action="load" data-id="${preset.id}" class="outline icon" title="Load"><i class="fas fa-arrow-circle-down"></i></button> <button data-action="details" data-id="${preset.id}" class="outline icon" title="View details"><i class="fa-solid fa-eye"></i></button> <button data-action="delete" data-id="${preset.id}" class="outline icon" title="Delete preset"><i class="fa-solid fa-trash"></i></button> <button data-action="share" data-id="${preset.id}" class="outline icon" title="Share preset"><i class="fa-solid fa-share"></i></button>`;
      // const prompt = preset.getPrompt();
      const languageModelSettings = preset.getLanguageModelSettings();
      console.log(languageModelSettings);
      return {
        id: preset.name,
        ...preset,
        tags: makeTagHtml(preset.tags),
        actions: actionsHtml,
        provider: languageModelSettings.provider,
        model: languageModelSettings.apiSettings.model,
      };
    });
    this._datatable.updateRows(rows);
    this._datatable.render();
    this.addListeners();
  }

  public renderDetailsModal(preset: Preset): void {
    const settings = { ...preset.getLanguageModelSettings() };
    delete settings.id;
    delete settings.name;
    delete settings.apiSettings.apiKey;
    const props = {
      name: preset.name,
      tags: preset.tags.join(", "),
      tagsHtml:
        preset.tags.length > 0 ? makeTagHtml(preset.tags) : "<span>None</span>",
      prompt: preset.getPrompt().text,
      settings: JSON.stringify(settings, null, 2),
    };
    const body = document.createElement("div");
    body.innerHTML = renderTemplate(presetDetailsHtml, props);
    this.detailsModal.body = body;
    this.addDetailsModalListeners(preset);
    this.detailsModal.render();
  }

  private addDetailsModalListeners(preset: Preset): void {
    const body = this.detailsModal.body;
    const editTagsButton = body.querySelector(
      ".edit-tags-button"
    ) as HTMLButtonElement;
    const saveTagsButton = body.querySelector(
      ".save-tags-button"
    ) as HTMLButtonElement;
    const tagsHtml = body.querySelector(".tags-html") as HTMLSpanElement;
    editTagsButton.addEventListener("click", () => {
      const tagsInput = body.querySelector(".tags-input") as HTMLInputElement;
      tagsInput.classList.remove("hidden");
      editTagsButton.classList.add("hidden");
      saveTagsButton.classList.remove("hidden");
      tagsHtml.classList.add("hidden");
    });
    const saveTags = () => {
      const tagsInput = body.querySelector(".tags-input") as HTMLInputElement;
      const tags = tagsInput.value.split(",").map((tag) => tag.trim());
      preset.tags = tags;
      db.updatePreset(preset);
      editTagsButton.classList.remove("hidden");
      saveTagsButton.classList.add("hidden");
      tagsInput.classList.add("hidden");
      tagsHtml.classList.remove("hidden");
      tagsHtml.innerHTML = makeTagHtml(tags);
    };
    saveTagsButton.addEventListener("click", () => {
      saveTags();
    });
    const tagsInput = body.querySelector(".tags-input") as HTMLInputElement;
    tagsInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        saveTags();
      }
    });
  }

  private addListeners(): void {
    const buttons = this.container.querySelectorAll("button");
    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const action = button.dataset.action;
        const id = button.dataset.id;
        const preset = this.presets.find((preset) => preset.id === id);
        if (!preset) {
          return;
        }
        switch (action) {
          case "load":
            this.onLoad(preset);
            break;
          case "details":
            this.renderDetailsModal(preset);
            this.detailsModal.show();
            break;
          case "delete":
            if (confirm(`Are you sure you want to delete ${preset.name}?`)) {
              db.deletePreset(preset);
              this.presets = this.presets.filter((p) => p.id !== preset.id);
              this.render();
            }
            break;
          case "share":
            const serializedPreset = JSON.stringify(preset.serialize());
            const shareModal = new Modal({
              title: "Share preset",
            });
            const shareModalBody = document.createElement("div");
            shareModalBody.innerHTML = `<div class="mt-2"><strong>Copy the following text which can be used to import this preset:</strong><br><br><textarea style="width: 90%; height: 200px;" readonly>${serializedPreset}</textarea></div>`;
            shareModal.body = shareModalBody;
            shareModal.render();
            shareModal.show();
        }
      });
    });
  }
}
