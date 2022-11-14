import playgroundViewHtml from "./playground-view.html?raw";
import { LanguageModel } from "../lang-model/lang-model";
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

const envVars = parseEnv(env);

export class PlaygroundView {
  container: HTMLDivElement;
  playgroundTextArea: HTMLTextAreaElement | null = null;
  saveTemplateButton: HTMLButtonElement | null = null;
  templateContainer: HTMLDivElement | null = null;

  constructor(container: HTMLDivElement) {
    this.container = container;
  }

  render() {
    this.container.innerHTML = playgroundViewHtml;
    this.playgroundTextArea = document.querySelector(
      "#playground-textarea"
    ) as HTMLTextAreaElement;
    this.saveTemplateButton = document.querySelector(
      "#save-template-button"
    ) as HTMLButtonElement;
    this.templateContainer = document.querySelector(
      "#template-container"
    ) as HTMLDivElement;
    // const output = document.querySelector("#playground-output") as HTMLDivElement;
    // const langModel = new LanguageModel(envVars);
    // textarea.addEventListener("input", () => {
    //   const text = textarea.value;
    //   const html = mdToHtml(text);
    //   output.innerHTML = html;
    // });
    // autosizeTextarea(textarea);
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
    this.saveTemplateButton?.addEventListener("click", () => {
      console.log("Save template");
      const template = this.playgroundTextArea?.value;
      if (template) {
        const name = prompt("Name for template");
        if (name) {
          const promptTemplate = new PromptTemplate({
            name,
            template,
            projectId: "test-project",
          });
          console.log("Prompt template", promptTemplate);
          createPromptTemplate(promptTemplate);
          this.render();
        }
      }
    });
  }
}
