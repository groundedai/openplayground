import playgroundViewHtml from "./playground-view.html?raw";
import { cohereGenerationSettingsSchema, CohereGenerationSettings, CohereLanguageModel } from "../lang-model/cohere";
import { autosizeTextarea } from "../util/dom";
import env from "../../.env?raw";
import { parseEnv } from "../util/env";
import { mdToHtml } from "../util/markdown";
import { PromptTemplate } from "../types";
import {
  createPromptTemplate,
  getPromptTemplates,
} from "../db/prompt-templates";
import { DataTable } from "../components/datatable";
import { SettingsPanel } from "../components/settings-panel";

const envVars = parseEnv(env);

export class PlaygroundView {
  container: HTMLDivElement;
  playgroundTextArea: HTMLTextAreaElement | null = null;
  suggestButton: HTMLButtonElement | null = null;
  saveTemplateButton: HTMLButtonElement | null = null;
  templateContainer: HTMLDivElement | null = null;
  settingsContainer: HTMLDivElement | null = null;
  settingsPanel: SettingsPanel | null = null;

  constructor(container: HTMLDivElement) {
    this.container = container;
  }

  render() {
    this.container.innerHTML = playgroundViewHtml;
    this.playgroundTextArea = document.querySelector(
      "#playground-textarea"
    ) as HTMLTextAreaElement;
    this.suggestButton = document.querySelector(
      "#suggest-button"
    ) as HTMLButtonElement;
    this.saveTemplateButton = document.querySelector(
      "#save-template-button"
    ) as HTMLButtonElement;
    this.templateContainer = document.querySelector(
      "#template-container"
    ) as HTMLDivElement;
    this.settingsContainer = document.querySelector(
      "#settings-container"
    ) as HTMLDivElement;
    this.settingsPanel = new SettingsPanel(
      this.settingsContainer,
      cohereGenerationSettingsSchema
    );
    this.settingsPanel.render();
    const settings = localStorage.getItem("playgroundCohereGenerationSettings");
    if (settings) {
      this.settingsPanel.setSettings(JSON.parse(settings));
    }
    const promptTemplates = getPromptTemplates().map((pt) => ({
      id: pt.name,
      name: pt.name,
      template: mdToHtml(pt.template),
    }));
    const promptTemplatesColumns = [
      {
        name: "Name",
        key: "name",
      },
      {
        name: "Text",
        key: "template",
      },
    ];
    const dataTable = new DataTable(
      this.templateContainer,
      promptTemplates,
      promptTemplatesColumns
    );
    dataTable.render();
    this.addListeners();
  }

  addListeners() {
    this.suggestButton?.addEventListener("click", () => {
      const settings: CohereGenerationSettings = this.settingsPanel?.getSettings();
      const text = this.playgroundTextArea?.value;
      console.log("Settings", settings);
      console.log("Text", text);
      if (text && settings) {
        const langModel = new CohereLanguageModel({
          apiKey: envVars.COHERE_API_KEY,
          settings,
        });
        langModel
          .getSuggestions(text)
          .then((res) => {
            console.log("Response", res);
            const responseText = res.text
            this.playgroundTextArea!.value += responseText;
          })
          .catch((err) => {
            console.error(err);
          });
      }
    });
    this.saveTemplateButton?.addEventListener("click", () => {
      console.log("Save template");
      const template = this.playgroundTextArea?.value;
      if (template) {
        const name = prompt("Name for template");
        if (name) {
          const promptTemplate = new PromptTemplate({
            name,
            template,
          });
          console.log("Prompt template", promptTemplate);
          createPromptTemplate(promptTemplate);
          this.render();
        }
      }
    });
    this.settingsPanel?.container.addEventListener(
      "settings-change",
      (e: any) => {
        console.log("Settings change", e.detail);
        const settings = this.settingsPanel?.getSettings();
        if (settings) {
          localStorage.setItem(
            "playgroundCohereGenerationSettings",
            JSON.stringify(settings)
          );
        }
      }
    );
  }
}
