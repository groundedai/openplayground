import "./playground.css";
import playgroundViewHtml from "./playground-view.html?raw";
import {
  cohereGenerationSettingsSchema,
  CohereGenerationSettings,
  CohereLanguageModel,
} from "../providers/cohere";
import {
  openaiGenerationSettingsSchema,
  openaiGenerationSettings,
  OpenAILanguageModel,
} from "../providers/openai";
import { autosizeTextarea } from "../util/dom";
import { mdToHtml, htmlToMd } from "../util/markdown";
import { PromptTemplate, LanguageModelSettings } from "../types";
import {
  createPromptTemplate,
  getPromptTemplates,
  deletePromptTemplate,
} from "../db/prompt-templates";
import {
  createLanguageModelSettings,
  getLanguageModelSettings,
  deleteLanguageModelSettings,
} from "../db/language-model-settings";
import { getDatasets } from "../db/datasets";
import { getRecords } from "../db/records";
import { DataTable } from "../components/datatable";
import { SettingsPanel } from "../components/settings-panel";
import { Modal } from "../components/modal";

const languageModelProviders = ["cohere", "openai"];
const providerToSettingsSchema: {
  [key: string]: any;
} = {
  cohere: cohereGenerationSettingsSchema,
  openai: openaiGenerationSettingsSchema,
};
const providerToStorageKey: {
  [key: string]: string;
} = {
  cohere: "playgroundCohereGenerationSettings",
  openai: "playgroundOpenAIGenerationSettings",
};
const providerToClass: {
  [key: string]: any;
} = {
  cohere: CohereLanguageModel,
  openai: OpenAILanguageModel,
};
const defaultProvider = "cohere";

export class PlaygroundView {
  container: HTMLDivElement;
  useContentEditable = false;
  autoSuggest = false;
  playgroundTextArea: HTMLTextAreaElement | null = null;
  textAreaLoadingDiv: HTMLDivElement | null = null;
  suggestButtonLoadingDiv: HTMLDivElement | null = null;
  playgroundEditable: HTMLSpanElement | null = null;
  suggestButton: HTMLButtonElement | null = null;
  saveTemplateButton: HTMLButtonElement | null = null;
  saveSettingsButton: HTMLButtonElement | null = null;
  templateContainer: HTMLDivElement | null = null;
  settingsContainer: HTMLDivElement | null = null;
  settingsPanel: SettingsPanel | null = null;
  savedSettingsContainer: HTMLDivElement | null = null;
  insertRecordButton: HTMLButtonElement | null = null;
  insertRecordModalContainer: HTMLDivElement | null = null;
  autoSuggestSwitch: HTMLInputElement | null = null;
  languageModelProviderSelect: HTMLSelectElement | null = null;
  languageModelProvider: string | null = null;
  editorCharCountSpan: HTMLSpanElement | null = null;

  constructor(
    container: HTMLDivElement,
    useContentEditable = false,
    autoSuggest = false
  ) {
    this.container = container;
    this.useContentEditable = useContentEditable;
    this.autoSuggest = autoSuggest;
  }

  render() {
    this.container.innerHTML = playgroundViewHtml;
    this.textAreaLoadingDiv = document.querySelector(
      "#playground-textarea-loading"
    ) as HTMLDivElement;
    this.playgroundTextArea = document.querySelector(
      "#playground-textarea"
    ) as HTMLTextAreaElement;
    this.playgroundEditable = document.querySelector(
      "#playground-editable"
    ) as HTMLSpanElement;
    if (this.useContentEditable) {
      this.playgroundTextArea!.style.display = "none";
      // this.playgroundEditable!.style.display = "block";
    } else {
      this.playgroundTextArea!.style.display = "block";
      // this.playgroundEditable!.style.display = "none";
    }
    this.suggestButton = document.querySelector(
      "#suggest-button"
    ) as HTMLButtonElement;
    this.suggestButtonLoadingDiv = document.querySelector(
      "#suggest-button-loading"
    ) as HTMLDivElement;
    this.saveTemplateButton = document.querySelector(
      "#save-template-button"
    ) as HTMLButtonElement;
    this.saveSettingsButton = document.querySelector(
      "#save-settings-button"
    ) as HTMLButtonElement;
    this.templateContainer = document.querySelector(
      "#templates-container"
    ) as HTMLDivElement;
    this.languageModelProviderSelect = document.querySelector(
      "#language-model-provider-select"
    ) as HTMLSelectElement;
    this.settingsContainer = document.querySelector(
      "#settings-container"
    ) as HTMLDivElement;
    this.savedSettingsContainer = document.querySelector(
      "#saved-settings-container"
    ) as HTMLDivElement;
    this.insertRecordButton = document.querySelector(
      "#insert-record-button"
    ) as HTMLButtonElement;
    this.insertRecordModalContainer = document.querySelector(
      "#insert-record-modal"
    ) as HTMLDivElement;
    this.autoSuggestSwitch = document.querySelector(
      "#auto-suggest-switch"
    ) as HTMLInputElement;
    this.editorCharCountSpan = document.querySelector(
      "#char-count-value"
    ) as HTMLSpanElement;
    this.setupSettingsPanel();
    // Load settings from local storage
    const settingsStorageKey =
      providerToStorageKey[this.languageModelProvider!];
    const settings = localStorage.getItem(settingsStorageKey);
    if (settings) {
      console.log(
        `Loading settings for ${this.languageModelProvider}`,
        settings
      );
      const lms = new LanguageModelSettings({
        provider: this.languageModelProvider!,
        settings: JSON.parse(settings),
      });
      this.renderSettings(lms);
    }
    const textareaContent = this.getFromLocalStorage();
    if (textareaContent) {
      this.setPlaygroundContent(textareaContent);
    }
    this.renderTemplates();
    this.renderSavedSettings();
    this.editorCharCountSpan.innerText =
      this.getPlaygroundText().length.toString();
    this.addListeners();
  }

  setupSettingsPanel() {
    this.languageModelProviderSelect!.innerHTML = "";
    languageModelProviders.forEach((provider) => {
      const option = document.createElement("option");
      option.value = provider;
      option.innerText = provider;
      this.languageModelProviderSelect!.appendChild(option);
    });
    if (!this.languageModelProvider) {
      this.languageModelProvider =
        localStorage.getItem("playgroundLanguageModelProvider") ||
        defaultProvider;
    }
    this.languageModelProviderSelect!.value = this.languageModelProvider;
  }

  renderSettings(settings: LanguageModelSettings) {
    this.languageModelProvider = settings.provider;
    this.languageModelProviderSelect!.value = this.languageModelProvider;
    const settingsSchema = providerToSettingsSchema[this.languageModelProvider];
    this.settingsPanel = new SettingsPanel(
      this.settingsContainer!,
      settingsSchema
    );
    this.settingsPanel.render();
    this.settingsPanel.setSettings(settings.settings);
  }

  setPlaygroundContent(content: string) {
    if (this.useContentEditable) {
      let html = content.replace(/\n/g, "<br>");
      this.playgroundEditable!.innerHTML = html;
    } else {
      this.playgroundTextArea!.value = content;
    }
    this.saveToLocalStorage();
  }

  appendPlaygroundContent(content: string) {
    if (this.useContentEditable) {
      let html = content.replace(/\n/g, "<br>");
      this.playgroundEditable!.innerHTML += html;
    } else {
      this.playgroundTextArea!.value += content;
    }
    this.editorCharCountSpan!.innerText =
      this.getPlaygroundText().length.toString();
    this.saveToLocalStorage();
  }

  insertSuggestion(suggestion: string) {
    if (this.useContentEditable) {
      this.playgroundEditable!.dataset.suggestion = suggestion;
    } else {
      const textarea = this.playgroundTextArea!;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const isEndOfText = end === text.length;
      if (isEndOfText) {
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        textarea.value = before + suggestion + after;
        textarea.selectionStart = start;
        textarea.selectionEnd = start + suggestion.length;
      }
    }
  }

  getPlaygroundText() {
    if (this.useContentEditable) {
      const html = this.playgroundEditable!.innerHTML;
      const md = htmlToMd(html);
      return md;
    } else {
      return this.playgroundTextArea!.value;
    }
  }

  setLoading(isLoading: boolean) {
    if (isLoading) {
      this.textAreaLoadingDiv?.classList.remove("hidden");
      this.suggestButtonLoadingDiv?.classList.remove("hidden");
    } else {
      this.textAreaLoadingDiv?.classList.add("hidden");
      this.suggestButtonLoadingDiv?.classList.add("hidden");
    }
  }

  saveToLocalStorage() {
    localStorage.setItem("playgroundTextareaContent", this.getPlaygroundText());
  }

  getFromLocalStorage() {
    return localStorage.getItem("playgroundTextareaContent") || "";
  }

  renderTemplates() {
    const rows = getPromptTemplates().map((pt) => {
      let template = pt.template.replace(/(\r\n|\n|\r)/gm, " ");
      // if (template.length > 100) {
      //   template = template.substring(0, 200) + "...";
      // }
      // template = mdToHtml(template);
      const row = {
        id: pt.name,
        name: pt.name,
        template,
        actions: `<button data-id="${pt.name}" data-action="load" class="outline">Load</button> <button data-id="${pt.name}" data-action="delete" class="outline danger">Delete</button>`,
      };
      return row;
    });
    const columns = [
      {
        name: "Name",
        key: "name",
        classes: ["text-center"],
      },
      {
        name: "Text",
        key: "template",
      },
      {
        name: "Actions",
        key: "actions",
        classes: ["fitwidth"],
      },
    ];
    const dataTable = new DataTable(
      this.templateContainer!,
      rows,
      columns,
      "No templates"
    );
    dataTable.render();
    this.templateContainer!.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", (e) => {
        const id = button.dataset.id;
        const action = button.dataset.action;
        const pt = getPromptTemplates().find((pt) => pt.name === id);
        if (action === "delete") {
          deletePromptTemplate(pt);
          this.renderTemplates();
        } else if (action === "load") {
          this.setPlaygroundContent(pt.template);
        }
      });
    });
  }

  renderSavedSettings() {
    const rows = getLanguageModelSettings().map((lms) => ({
      id: lms.name,
      name: lms.name,
      actions: `<button data-action="load" data-id="${lms.name}" class="outline">Load</button> <button data-action="delete" data-id="${lms.name}" class="outline danger">Delete</button>`,
    }));
    const columns = [
      {
        name: "Name",
        key: "name",
      },
      {
        name: "Actions",
        key: "actions",
      },
    ];
    const dataTable = new DataTable(
      this.savedSettingsContainer!,
      rows,
      columns,
      "No saved settings"
    );
    dataTable.render();
    const loadSettingsButtons = document.querySelectorAll("[data-action=load]");
    loadSettingsButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const id = (e.target as HTMLButtonElement).dataset.id;
        const settings = getLanguageModelSettings().find(
          (lms) => lms.name === id
        );
        console.log(settings);
        if (settings) {
          this.renderSettings(settings);
        }
      });
    });
    const deleteSettingsButtons = document.querySelectorAll(
      "[data-action=delete]"
    );
    deleteSettingsButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const id = (e.target as HTMLButtonElement).dataset.id;
        const settings = getLanguageModelSettings().find(
          (lms) => lms.name === id
        );
        if (settings) {
          deleteLanguageModelSettings(settings);
          this.renderSavedSettings();
        }
      });
    });
  }

  getSuggestions() {
    this.setLoading(true);
    const settings = this.getLanguageModelSettings();
    const text = this.getPlaygroundText();
    console.log("Settings", settings);
    console.log("Text", text);
    if (text && settings) {
      const langModelClass = providerToClass[settings.provider];
      const langModel = new langModelClass(settings.settings);
      if (langModel) {
        langModel
          .getSuggestions(text)
          .then((res: { data: any; text: string }) => {
            console.log("Response", res);
            const responseText = res.text;
            this.appendPlaygroundContent(responseText);
            // this.insertSuggestion(responseText);
            this.setLoading(false);
          })
          .catch((err: any) => {
            console.error(err);
            alert("Error getting suggestions: " + err.message);
            this.setLoading(false);
          });
      } else {
        alert("Error getting suggestions");
        this.setLoading(false);
      }
    }
  }

  getLanguageModelSettings(): LanguageModelSettings {
    const settings = this.settingsPanel?.getSettings();
    if (settings) {
      const languageModelSettings = new LanguageModelSettings({
        provider: this.languageModelProvider!,
        settings,
      });
      console.log("Language model settings", languageModelSettings);
      return languageModelSettings;
    } else {
      throw new Error("No settings");
    }
  }

  addListeners() {
    this.suggestButton?.addEventListener("click", () => {
      this.getSuggestions();
    });
    this.saveTemplateButton?.addEventListener("click", () => {
      console.log("Save template");
      const template = this.getPlaygroundText();
      if (template) {
        const name = prompt("Name for template");
        if (name) {
          const promptTemplate = new PromptTemplate({
            id: name,
            name,
            template,
          });
          console.log("Prompt template", promptTemplate);
          createPromptTemplate(promptTemplate);
          this.render();
        }
      }
    });
    this.saveSettingsButton?.addEventListener("click", () => {
      console.log("Save settings");
      const lms = this.getLanguageModelSettings();
      const name = prompt("Name for settings");
      if (name && lms) {
        lms.id = name;
        lms.name = name;
        createLanguageModelSettings(lms);
        console.log("Language model settings", lms);
        this.render();
      }
    });
    this.autoSuggestSwitch?.addEventListener("click", () => {
      const value = this.autoSuggestSwitch?.checked || false;
      this.autoSuggest = value;
    });
    this.insertRecordButton?.addEventListener("click", () => {
      const datasets = getDatasets();
      const datasetOptions = datasets.map((d) => ({
        value: d.id,
        label: d.name,
      }));
      const datasetSelect = document.createElement("select");
      datasetSelect.id = "dataset-select";
      datasetSelect.innerHTML = datasetOptions
        .map((o) => `<option value="${o.value}">${o.label}</option>`)
        .join("");
      const recordTableContainer = document.createElement("div");
      const renderRecordsTable = (datasetId: string) => {
        const dataset = datasets.find((d) => d.id === datasetId);
        if (dataset) {
          const records = getRecords().filter(
            (r) => r.datasetId === dataset.id
          );
          const rows = records.map((r) => ({
            id: r.id,
            text: r.text,
          }));
          const columns = [
            {
              name: "ID",
              key: "id",
            },
            {
              name: "Text",
              key: "text",
            },
          ];
          const rowClicked = (row: any) => {
            const record = records.find((r) => r.id === row.data.id);
            if (record) {
              this.appendPlaygroundContent(record.text);
            }
            modal.hide();
          };
          const dataTable = new DataTable(
            recordTableContainer,
            rows,
            columns,
            "No records",
            rowClicked
          );
          dataTable.render();
        }
      };
      datasetSelect.addEventListener("change", (e) => {
        const datasetId = (e.target as HTMLSelectElement).value;
        renderRecordsTable(datasetId);
      });
      datasetSelect.value = datasets[datasets.length - 1].id;
      const datasetSelectLabel = document.createElement("label");
      datasetSelectLabel.htmlFor = "dataset-select";
      datasetSelectLabel.innerText = "Dataset:";
      renderRecordsTable(datasetSelect.value);
      const modalBody = document.createElement("div");
      modalBody.appendChild(datasetSelectLabel);
      modalBody.appendChild(datasetSelect);
      const tableHeader = document.createElement("h4");
      tableHeader.innerText = "Select record to insert";
      modalBody.appendChild(tableHeader);
      modalBody.appendChild(recordTableContainer);
      const modal = new Modal(this.insertRecordModalContainer!, modalBody);
      modal.render();
      modal.show();
    });
    this.settingsPanel?.container.addEventListener(
      "settings-change",
      (e: any) => {
        console.log("Settings change", e.detail);
        const settings = this.settingsPanel?.getSettings();
        const settingsStorageKey =
          providerToStorageKey[this.languageModelProvider!];
        if (settings && settingsStorageKey) {
          localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
        }
      }
    );
    this.languageModelProviderSelect?.addEventListener("change", (e) => {
      const provider = (e.target as HTMLSelectElement).value;
      this.languageModelProvider = provider;
      localStorage.setItem("playgroundLanguageModelProvider", provider);
      this.render();
    });
    if (this.useContentEditable) {
      this.playgroundEditable?.addEventListener("input", () => {
        this.saveToLocalStorage();
      });
    } else {
      this.playgroundTextArea?.addEventListener("input", () => {
        this.saveToLocalStorage();
        this.editorCharCountSpan!.innerText =
          this.getPlaygroundText().length.toString();
        if (this.autoSuggest) {
          console.log("Auto suggest");
          // this.insertSuggestion("suggestion");
          this.getSuggestions();
        }
      });
    }
    // Control+Enter to get suggestions
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        this.getSuggestions();
      }
    });
  }
}
