import playgroundCss from "./playground-view.css?raw";
import playgroundViewHtml from "./playground-view.html?raw";
import { htmlToMd } from "../util/markdown";
import { newlinesToBreaks } from "../util/string";
import {
  Prompt,
  LanguageModelSettings,
  Preset,
  Dataset,
  Record,
} from "../types";
import { db } from "../main";
import { DataTable } from "../components/datatable";
import { PresetsTable } from "../components/presets-table";
import { SettingsPanel } from "../components/settings-panel";
import { Modal } from "../components/modal";
import { View } from "./view";
import {
  languageModelProviders,
  providerToSettingsSchema,
  providerToStorageKey,
  providerToClass,
  defaultProvider,
} from "../providers";
import presetFormHtml from "../components/preset-form.html?raw";
import previewTemplateHtml from "../components/preview-template.html?raw";
import presetsPanelHtml from "../components/presets-panel.html?raw";
import { errorMessageDuration, textPlaceholderRegex } from "../globals";
import { renderTemplate } from "../util/string";
import { createPresetFromYAML } from "../presets";

export class PlaygroundView extends View {
  useContentEditable: boolean = false;
  autoSuggest: boolean = false;
  playgroundTextArea: HTMLTextAreaElement = document.querySelector(
    "#playground-textarea"
  ) as HTMLTextAreaElement;
  textAreaLoadingDiv: HTMLDivElement = document.querySelector(
    "#playground-textarea-loading"
  ) as HTMLDivElement;
  suggestButtonLoadingDiv: HTMLDivElement = document.querySelector(
    "#suggest-button-loading"
  ) as HTMLDivElement;
  playgroundEditable: HTMLSpanElement | null = null;
  suggestButton: HTMLButtonElement = document.querySelector(
    "#suggest-button"
  ) as HTMLButtonElement;
  insertPlaceholderButton: HTMLButtonElement = document.querySelector(
    "#insert-placeholder-button"
  ) as HTMLButtonElement;
  saveTemplateButton: HTMLButtonElement = document.querySelector(
    "#save-template-button"
  ) as HTMLButtonElement;
  savePresetButton: HTMLButtonElement = document.querySelector(
    "#save-preset-button"
  ) as HTMLButtonElement;
  presetModal: Modal;
  previewTemplateButton: HTMLButtonElement = document.querySelector(
    "#preview-template-button"
  ) as HTMLButtonElement;
  saveSettingsButton: HTMLButtonElement = document.querySelector(
    "#save-settings-button"
  ) as HTMLButtonElement;
  loadSettingsButton: HTMLButtonElement = document.querySelector(
    "#load-settings-button"
  ) as HTMLButtonElement;
  templateContainer: HTMLDivElement = document.querySelector(
    "#templates-container"
  ) as HTMLDivElement;
  settingsContainer: HTMLDivElement = document.querySelector(
    "#settings-container"
  ) as HTMLDivElement;
  savedSettingsContainer: HTMLDivElement = document.createElement("div");
  savedSettingsModal: Modal;
  insertRecordButton: HTMLButtonElement = document.querySelector(
    "#insert-record-button"
  ) as HTMLButtonElement;
  insertRecordModalContainer: HTMLDivElement = document.querySelector(
    "#insert-record-modal"
  ) as HTMLDivElement;
  autoSuggestSwitch: HTMLInputElement = document.querySelector(
    "#auto-suggest-switch"
  ) as HTMLInputElement;
  languageModelProviderSelect: HTMLSelectElement = document.querySelector(
    "#language-model-provider-select"
  ) as HTMLSelectElement;
  editorCharCountSpan: HTMLSpanElement = document.querySelector(
    "#char-count-value"
  ) as HTMLSpanElement;
  languageModelProvider: string | null = null;
  settingsPanel: SettingsPanel | null = null;
  presetsTableContainer: HTMLDivElement | null = null;
  presetsTable: PresetsTable | null = null;
  importPresetButton: HTMLButtonElement | null = null;
  hideExamplePresetsCheckbox: HTMLInputElement | null = null;
  hideExamplePresets: boolean = false;
  showPresetsButton: HTMLButtonElement = document.querySelector(
    "#show-presets-button"
  ) as HTMLButtonElement;

  constructor({ container }: { container: HTMLDivElement }) {
    super({ container, html: playgroundViewHtml, css: playgroundCss });
    this.savedSettingsContainer.id = "saved-settings-container";
    this.savedSettingsModal = new Modal({
      title: "Saved Settings",
      body: this.savedSettingsContainer,
    });
    this.presetModal = new Modal({
      title: "Save Preset",
    });
    this.initLeftDrawer();
    this.initListeners();
  }

  initLeftDrawer() {
    this.leftDrawer.openTriggers = [this.showPresetsButton];
    const body = document.createElement("div");
    body.innerHTML = presetsPanelHtml;
    this.leftDrawer.body.appendChild(body);
    this.importPresetButton = document.querySelector(
      ".import-preset-button"
    ) as HTMLButtonElement;
    this.hideExamplePresetsCheckbox = document.querySelector(
      ".hide-example-presets-checkbox"
    ) as HTMLInputElement;
    this.presetsTableContainer = document.querySelector(
      "#presets-table-container"
    ) as HTMLDivElement;
  }

  render() {
    this.playgroundEditable = document.querySelector(
      "#playground-editable"
    ) as HTMLSpanElement;
    if (this.useContentEditable) {
      this.playgroundTextArea.classList.add("hidden");
      // this.playgroundEditable!.style.display = "block";
    } else {
      this.playgroundTextArea.classList.remove("hidden");
      // this.playgroundEditable!.style.display = "none";
    }
    const provider =
      this.languageModelProvider ||
      localStorage.getItem("playgroundLanguageModelProvider") ||
      defaultProvider;
    this.changeLanguageModelProvider(provider);
    const textareaContent = this.getFromLocalStorage();
    if (textareaContent) {
      this.setPlaygroundContent(textareaContent);
    }
    this.renderPresetsTable();
    this.updateListeners();
  }

  changeLanguageModelProvider(provider: string) {
    this.languageModelProvider = provider;
    this.setupSettingsPanel();
    // Load settings from local storage
    const settingsStorageKey =
      providerToStorageKey[this.languageModelProvider!];
    const settings = localStorage.getItem(settingsStorageKey);
    if (settings) {
      const lms = new LanguageModelSettings({
        provider: this.languageModelProvider!,
        apiSettings: JSON.parse(settings),
      });
      this.renderSettings(lms);
    }
    localStorage.setItem("playgroundLanguageModelProvider", provider);
  }

  renderPresetsTable() {
    const presets = db.getPresets();
    this.presetsTable = new PresetsTable({
      presets,
      container: this.presetsTableContainer!,
      onLoad: (preset: Preset) => {
        const prompt = preset.getPrompt();
        this.setPlaygroundContent(prompt.text);
        const settings = preset.getLanguageModelSettings();
        const provider = settings.provider;
        // Set the provider, which will also load apiKey from local storage
        this.languageModelProviderSelect.value = provider;
        this.languageModelProviderSelect.dispatchEvent(new Event("change"));
        const apiSettings = { ...settings.apiSettings };
        delete apiSettings.apiKey;
        const settingsSchema = providerToSettingsSchema[provider];
        Object.keys(apiSettings).forEach((key) => {
          Object.keys(settingsSchema).forEach((settingName) => {
            const schemaKey = settingsSchema[settingName].key;
            if (schemaKey === key) {
              const value = apiSettings[key];
              this.settingsPanel!.setSetting(settingName, value);
            }
          });
        });
        // Dispatch change event to update the settings
        this.settingsPanel!.container.dispatchEvent(new Event("change"));
        this.leftDrawer.close();
      },
      hideExamplePresets: this.hideExamplePresets,
    });
    this.presetsTable.render();
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
    this.settingsPanel = new SettingsPanel(
      this.settingsContainer,
      providerToSettingsSchema[this.languageModelProvider]
    );
    this.settingsPanel.render();
  }

  renderSettings(settings: LanguageModelSettings) {
    this.languageModelProvider = settings.provider;
    this.languageModelProviderSelect!.value = this.languageModelProvider;
    const settingsSchema = providerToSettingsSchema[this.languageModelProvider];
    this.settingsPanel = new SettingsPanel(
      this.settingsContainer,
      settingsSchema
    );
    this.settingsPanel.render();
    this.settingsPanel.setSettings(settings.apiSettings);
  }

  setPlaygroundContent(content: string) {
    if (this.useContentEditable) {
      let html = newlinesToBreaks(content);
      this.playgroundEditable!.innerHTML = html;
    } else {
      this.playgroundTextArea!.value = content;
    }
    this.playgroundTextArea.dispatchEvent(new Event("input"));
  }

  appendPlaygroundContent(content: string) {
    if (this.useContentEditable) {
      let html = newlinesToBreaks(content);
      this.playgroundEditable!.innerHTML += html;
    } else {
      this.playgroundTextArea!.value += content;
    }
    this.playgroundTextArea.dispatchEvent(new Event("input"));
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
      // this.textAreaLoadingDiv.classList.remove("hidden");
      this.suggestButtonLoadingDiv.classList.remove("hidden");
    } else {
      // this.textAreaLoadingDiv.classList.add("hidden");
      this.suggestButtonLoadingDiv.classList.add("hidden");
    }
  }

  saveToLocalStorage() {
    localStorage.setItem("playgroundTextareaContent", this.getPlaygroundText());
    const settings = this.settingsPanel?.getSettings();
    const settingsStorageKey =
      providerToStorageKey[this.languageModelProvider!];
    if (settings && settingsStorageKey) {
      localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
    }
  }

  getFromLocalStorage() {
    return localStorage.getItem("playgroundTextareaContent") || "";
  }

  getSuggestions() {
    this.setLoading(true);
    const settings = this.getLanguageModelSettings();
    const text = this.getPlaygroundText();
    if (text.length === 0) {
      this.setLoading(false);
      this.showSnackbar({ messageHtml: "Please enter some text" });
      return;
    } else if (settings) {
      const modelClass = providerToClass[settings.provider];
      const model = new modelClass(settings.apiSettings);
      if (model) {
        model
          .getSuggestions(text)
          .then((res: { data: any; text: string }) => {
            console.log("Response", res);
            const responseText = res.text;
            this.appendPlaygroundContent(responseText);
            this.setLoading(false);
          })
          .catch((err: any) => {
            console.log("Error", err);
            this.showSnackbar({
              messageHtml: `<strong>${err.name}</strong>: "${err.message}"`,
              type: "error",
              duration: errorMessageDuration,
            });
            this.setLoading(false);
          });
      } else {
        this.showSnackbar({
          messageHtml: `Error getting suggestions`,
          type: "error",
          duration: errorMessageDuration,
        });
        this.setLoading(false);
      }
    }
  }

  getLanguageModelSettings(): LanguageModelSettings {
    const settings = this.settingsPanel?.getSettings();
    if (settings) {
      const languageModelSettings = new LanguageModelSettings({
        provider: this.languageModelProvider!,
        apiSettings: settings,
      });
      return languageModelSettings;
    } else {
      throw new Error("No settings");
    }
  }

  addEditorListeners() {
    if (this.useContentEditable) {
      this.playgroundEditable?.addEventListener("input", () => {
        this.saveToLocalStorage();
      });
    } else {
      this.playgroundTextArea.addEventListener("input", () => {
        console.log("Playground text area input");
        this.saveToLocalStorage();
        this.editorCharCountSpan.textContent =
          this.getPlaygroundText().length.toString();
        if (this.autoSuggest) {
          console.log("Auto suggest");
          this.getSuggestions();
        }
        const placeholderMatch =
          this.getPlaygroundText().match(textPlaceholderRegex);
        if (placeholderMatch) {
          this.saveTemplateButton?.removeAttribute("disabled");
          this.previewTemplateButton?.removeAttribute("disabled");
        } else {
          this.saveTemplateButton?.setAttribute("disabled", "");
          this.previewTemplateButton?.setAttribute("disabled", "");
        }
      });
    }
  }

  getPlaygroundCursorPosition() {
    return this.playgroundTextArea.selectionStart;
  }

  setPlaygroundCursorPosition(position: number) {
    this.playgroundTextArea.selectionStart = position;
    this.playgroundTextArea.selectionEnd = position;
  }

  initListeners() {
    this.addEditorListeners();
    this.suggestButton.addEventListener("click", () => {
      this.getSuggestions();
    });
    this.savePresetButton?.addEventListener("click", () => {
      const body = document.createElement("div");
      body.innerHTML = presetFormHtml;
      const presetForm = body.querySelector("form") as HTMLFormElement;
      presetForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(presetForm);
        const name = formData.get("name") as string;
        const tags = formData.get("tags") as string;
        let tagList = tags.split(",").map((t) => t.trim());
        tagList = tagList.filter((t) => t.length > 0);
        const prompt = new Prompt({
          name: `${name} - prompt`,
          text: this.getPlaygroundText(),
        });
        db.createPrompt(prompt);
        const settings = this.getLanguageModelSettings();
        db.createLanguageModelSettings(settings);
        const preset = new Preset({
          name,
          promptId: prompt.id,
          languageModelSettingsId: settings.id,
          tags: tagList,
        });
        console.log("Before create preset", preset);
        db.createPreset(preset);
        console.log("Created preset", preset);
        this.render();
        this.presetModal.hide();
      });
      this.presetModal.body = body;
      this.presetModal.render();
      this.presetModal.show();
    });
    this.insertPlaceholderButton?.addEventListener("click", () => {
      const position = this.getPlaygroundCursorPosition();
      const text = this.getPlaygroundText();
      const textBefore = text.substring(0, position);
      const textAfter = text.substring(position);
      const newText = `${textBefore}{{text}}${textAfter}`;
      this.setPlaygroundContent(newText);
      this.setPlaygroundCursorPosition(position + 7);
    });
    this.previewTemplateButton?.addEventListener("click", () => {
      const placeholderMatch =
        this.getPlaygroundText().match(textPlaceholderRegex);
      if (placeholderMatch) {
        if (placeholderMatch.length > 1) {
          this.showSnackbar({
            messageHtml: "Multiple placeholders found. Please only use one.",
            type: "error",
          });
        } else {
          // Open preview modal
          const body = document.createElement("div");
          body.innerHTML = previewTemplateHtml;
          const previewModal = new Modal({
            title: "Preview with Record",
            body,
          });
          previewModal.render();
          previewModal.show();
          const datasetSelect = body.querySelector(
            "#dataset-select"
          ) as HTMLSelectElement;
          const previewArea = body.querySelector(
            "#preview-area"
          ) as HTMLTextAreaElement;
          const loadPromptButton = body.querySelector(
            "#load-prompt-button"
          ) as HTMLButtonElement;
          // Make preview area larger
          previewArea.style.height = "300px";
          previewArea.style.width = "90%";
          // Set initial content to template
          previewArea.value = this.getPlaygroundText();
          // Load dataset select options
          const datasets = db.getDatasets();
          datasets.forEach((dataset: Dataset) => {
            const option = document.createElement("option");
            option.value = dataset.id! as string;
            option.textContent = dataset.name;
            datasetSelect.appendChild(option);
          });
          const recordSelect = body.querySelector(
            "#record-select"
          ) as HTMLSelectElement;
          recordSelect.addEventListener("change", () => {
            // Create preview and show in preview area
            const datasetId = datasetSelect.value;
            const recordId = recordSelect.value;
            const dataset = db
              .getDatasets()
              .find((d: Dataset) => d.id === datasetId);
            if (dataset) {
              const record = dataset
                .getRecords()
                .find((r: Record) => r.id === recordId);
              if (record) {
                const template = this.getPlaygroundText();
                const prompt = renderTemplate(template, { text: record.text });
                previewArea.value = prompt;
                loadPromptButton.removeAttribute("disabled");
              } else {
                loadPromptButton.setAttribute("disabled", "");
              }
            } else {
              loadPromptButton.setAttribute("disabled", "");
            }
          });
          datasetSelect.addEventListener("change", () => {
            // Load record select options
            const datasetId = datasetSelect.value;
            const dataset = db
              .getDatasets()
              .find((d: Dataset) => d.id === datasetId);
            if (dataset) {
              recordSelect.innerHTML = "";
              const records = dataset.getRecords();
              records.forEach((record: Record) => {
                const option = document.createElement("option");
                option.value = record.id! as string;
                option.textContent = record.id! as string;
                recordSelect.appendChild(option);
              });
            }
            // Dispatch change event to load preview
            recordSelect.dispatchEvent(new Event("change"));
          });
          loadPromptButton.addEventListener("click", () => {
            // Load prompt into playground
            const prompt = previewArea.value;
            this.setPlaygroundContent(prompt);
            previewModal.hide();
          });
          // const nextButton = body.querySelector(
          //   "#next-button"
          // ) as HTMLButtonElement;
          // const previousButton = body.querySelector(
          //   "#previous-button"
          // ) as HTMLButtonElement;
        }
      }
    });
    this.importPresetButton?.addEventListener("click", () => {
      // Open import modal
      const body = document.createElement("div");
      // Add helper message
      const helperMessage = document.createElement("p");
      helperMessage.innerHTML = "<strong>Paste preset string here:</strong>";
      body.appendChild(helperMessage);
      // Add text area to body
      const textArea = document.createElement("textarea");
      textArea.style.width = "90%";
      textArea.style.height = "100px";
      body.appendChild(textArea);
      // Add button to import
      const importButton = document.createElement("button");
      importButton.textContent = "Import";

      const importModal = new Modal({
        title: "Import Preset",
        body,
      });
      importModal.render();
      importButton.addEventListener("click", () => {
        const presetString = textArea.value;
        createPresetFromYAML(presetString);
        this.render();
        importModal.hide();
      });
      body.appendChild(importButton);
      importModal.show();
    });
    this.autoSuggestSwitch.addEventListener("click", () => {
      const value = this.autoSuggestSwitch.checked || false;
      this.autoSuggest = value;
    });
    this.insertRecordButton.addEventListener("click", () => {
      const datasets = db.getDatasets();
      const datasetOptions: HTMLOptionElement[] = datasets.map(
        (d: Dataset) => ({
          value: d.id,
          label: d.name,
        })
      );
      const datasetSelect = document.createElement("select");
      datasetSelect.id = "dataset-select";
      datasetSelect.innerHTML = datasetOptions
        .map((o) => `<option value="${o.value}">${o.label}</option>`)
        .join("");
      const recordTableContainer = document.createElement("div");
      const renderRecordsTable = (datasetId: string) => {
        const dataset = datasets.find((d: Dataset) => d.id === datasetId);
        if (dataset) {
          const records = db
            .getRecords()
            .filter((r: Record) => r.datasetId === dataset.id);
          const rows = records.map((r: Record) => ({
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
            const record = records.find((r: Record) => r.id === row.data.id);
            if (record) {
              this.appendPlaygroundContent(record.text);
            }
            modal.hide();
          };
          const dataTable = new DataTable({
            container: recordTableContainer,
            columns,
            rows,
            rowClicked,
            emptyMessage: "No records",
          });
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
      const modal = new Modal({
        body: modalBody,
      });
      modal.render();
      modal.show();
    });
    this.hideExamplePresetsCheckbox?.addEventListener("change", () => {
      this.hideExamplePresets = this.hideExamplePresetsCheckbox!.checked;
      this.render();
    });
    this.showPresetsButton.addEventListener("click", () => {
      this.leftDrawer.toggle();
    });
    this.leftDrawer.on("close", () => {
      this.showPresetsButton.innerHTML =
        'Show Presets'
    });
    this.leftDrawer.on("open", () => {
      this.showPresetsButton.innerHTML =
        "Hide Presets";
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        this.getSuggestions();
      }
    });
  }

  updateListeners() {
    this.settingsPanel?.on("change", (e: any) => {
      console.log("Settings change", e.detail);
      this.saveToLocalStorage();
    });
    this.languageModelProviderSelect.addEventListener("change", () => {
      const provider = this.languageModelProviderSelect.value;
      this.changeLanguageModelProvider(provider);
    });
  }
}
