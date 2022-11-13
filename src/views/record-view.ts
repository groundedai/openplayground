import { Record } from "../types";
import recordViewHtml from "./record-view.html?raw";
import { LanguageModel } from "../lang-model/lang-model";
import showdown from "showdown";
import { parseEnv } from "../util/env";
import env from "../../.env?raw";
import { autosizeTextarea } from "../util/dom";
import { updateRecord } from "../db/records";

const envVars = parseEnv(env);
const cohereApiKey = envVars.COHERE_API_KEY;

const mdConverter = new showdown.Converter();

export class RecordView {
  container: HTMLDivElement;
  record: Record;
  promptTextArea: HTMLTextAreaElement | null = null;
  langModel: LanguageModel | null = null;
  langModelConfig: any = null;

  constructor(container: HTMLDivElement, record: Record, langModelConfig: any) {
    this.container = container;
    this.record = record;
    if (!cohereApiKey) {
      throw new Error("COHERE_API_KEY not set");
    }
    this.langModel = new LanguageModel(cohereApiKey, langModelConfig);
  }

  render() {
    const html = recordViewHtml;
    let htmlWithProps = html;
    const props: any = {
      recordText: this.record.text,
    };
    for (const key in props) {
      const value = props[key];
      const re = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      htmlWithProps = htmlWithProps.replace(re, value);
    }
    this.container.innerHTML = htmlWithProps;
    this.promptTextArea = this.container.querySelector(
      "#prompt-content"
    ) as HTMLTextAreaElement;
    this.promptTextArea.value = this.record.text;
    autosizeTextarea(this.promptTextArea);
    this.promptTextArea.addEventListener("input", (e: Event) => {
      const target = e.target as HTMLTextAreaElement;
      autosizeTextarea(target);
    });
    this.addListeners();
    this.makePreview();
  }

  addListeners() {
    const suggestButton = this.container.querySelector(
      "#suggest-button"
    ) as HTMLButtonElement;
    suggestButton.addEventListener("click", (e: Event) => {
      e.preventDefault();
      const prompt = this.promptTextArea?.value;
      if (prompt) {
        this.langModel?.getSuggestions(prompt).then((res) => {
          console.log(res);
          if (res.text && this.promptTextArea) {
            this.promptTextArea.value += res.text;
            autosizeTextarea(this.promptTextArea);
          }
          this.makePreview();
        });
      }
    });
    this.promptTextArea?.addEventListener("input", () => {
      this.makePreview();
    });
    const saveButton = this.container.querySelector(
      "#save-button"
    ) as HTMLButtonElement;
    saveButton.addEventListener("click", (e: Event) => {
      e.preventDefault();
      const prompt = this.promptTextArea?.value;
      if (prompt) {
        this.record.text = prompt;
        updateRecord(this.record);
        console.log("saved record", this.record);
      }
    });
  }

  makePreview() {
    const previewContainer = this.container.querySelector(
      "#preview-content"
    ) as HTMLDivElement;
    let promptText = this.promptTextArea?.value || "";
    const html = mdConverter.makeHtml(promptText);
    previewContainer.innerHTML = html;
  }
}
