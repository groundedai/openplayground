import { db } from "./main";
import { textPlaceholderRegex } from "./globals";
import * as yaml from "yaml";

export type ID = string | number | null;

export class DBItem {
  id: ID;

  constructor({ id }: { id?: ID }) {
    this.id = id ? id.toString() : null;
  }
}

export class Record extends DBItem {
  text: string = "";
  datasetId: ID = null;

  constructor({
    id,
    text,
    datasetId,
  }: {
    id?: ID;
    text: string;
    datasetId?: string;
  }) {
    super({ id });
    this.text = text;
    this.datasetId = datasetId ? datasetId.toString() : null;
  }
}

export class Dataset extends DBItem {
  name: string;
  isExample: boolean;

  constructor({
    id,
    name,
    isExample,
  }: {
    id?: ID;
    name: string;
    isExample?: boolean;
  }) {
    super({ id });
    this.name = name;
    this.isExample = isExample ? isExample : false;
  }

  getRecords() {
    return db
      .getRecords()
      .filter((record: Record) => record.datasetId === this.id);
  }
}

export class Prompt extends DBItem {
  name: string;
  text: string;

  constructor({ id, name, text }: { id?: ID; name: string; text: string }) {
    super({ id });
    this.name = name;
    this.text = text;
  }

  hasPlaceholder() {
    const placeholderMatch = this.text.match(textPlaceholderRegex);
    return placeholderMatch !== null;
  }
}

export class LanguageModelSettings extends DBItem {
  name: string;
  provider: string;
  apiSettings: any;

  constructor({
    id,
    name,
    provider,
    apiSettings,
  }: {
    id?: ID;
    name?: string;
    provider: string;
    apiSettings: any;
  }) {
    super({ id });
    this.name = name ? name : "No name";
    this.provider = provider;
    this.apiSettings = apiSettings;
  }
}

export interface LanguageModel {
  settings: any;
  getSuggestions: (text: string) => Promise<{ data: any; text: string }>;
}

export class Preset extends DBItem {
  name: string;
  promptId: ID;
  languageModelSettingsId: ID;
  tags: string[];
  isExample: boolean;

  constructor({
    id,
    name,
    promptId,
    languageModelSettingsId,
    tags,
    isExample = false,
  }: {
    id?: ID;
    name: string;
    tags: string[];
    promptId: ID;
    languageModelSettingsId: ID;
    isExample?: boolean;
  }) {
    super({ id });
    this.name = name;
    this.promptId = promptId;
    this.tags = tags;
    this.languageModelSettingsId = languageModelSettingsId;
    this.isExample = isExample;
  }

  getPrompt() {
    return db.getPrompt(this.promptId);
  }

  getLanguageModelSettings() {
    return db.getLanguageModelSettings(this.languageModelSettingsId);
  }

  toYAML() {
    // To human readable YAML
    const prompt = this.getPrompt();
    const languageModelSettings = { ...this.getLanguageModelSettings() };
    delete languageModelSettings.id;
    delete languageModelSettings.name;
    delete languageModelSettings.apiSettings.apiKey;
    const json = {
      name: this.name,
      prompt: {
        name: prompt.name,
        text: prompt.text,
      },
      languageModelSettings: {
        name: languageModelSettings.name,
        provider: languageModelSettings.provider,
        apiSettings: languageModelSettings.apiSettings,
      },
      languageModelSettingsId: this.languageModelSettingsId,
      tags: this.tags,
    };
    return yaml.stringify(json);
  }
}

export enum ResultStatus {
  pending = "pending",
  running = "running",
  completed = "completed",
  failed = "failed",
}

export interface Result {
  text: string;
  status: ResultStatus;
}

export interface RunStatus {
  status: ResultStatus;
  completedRecords: Array<string>;
  failedRecords: Array<string>;
  totalRecords: number;
}

export interface ResultFormattingSettings {
  insertPromptTailBeforeResult: boolean;
  stripInitialWhiteSpace: boolean;
  injectStartText: string;
  stripEndText: string[];
}

export class Run extends DBItem {
  name: string;
  datasetId: string;
  presetId: string;
  results: { [recordId: string | number]: Result };
  resultFormattingSettings: ResultFormattingSettings;
  createdAt: Date;

  constructor({
    id,
    name,
    datasetId,
    presetId,
    results,
    resultFormattingSettings = {
      insertPromptTailBeforeResult: true,
      stripInitialWhiteSpace: false,
      injectStartText: "",
      stripEndText: [],
    },
    createdAt,
  }: {
    id?: ID;
    name?: string;
    datasetId: string;
    presetId: string;
    results?: { [recordId: string | number]: Result };
    resultFormattingSettings?: ResultFormattingSettings;
    createdAt?: Date;
  }) {
    super({ id });
    this.name = name ? name : `Run ${this.id}`;
    this.datasetId = datasetId;
    this.presetId = presetId;
    this.resultFormattingSettings = resultFormattingSettings;
    this.createdAt = new Date(createdAt || Date.now());
    if (results) {
      this.results = results;
    } else {
      this.results = {};
      this.resetResults();
    }
  }

  resetResults() {
    const records = db
      .getRecords()
      .filter((record: Record) => record.datasetId === this.datasetId);
    for (const record of records) {
      this.results[record.id] = {
        text: "",
        status: ResultStatus.pending,
      };
    }
  }

  getPreset() {
    return db.getPreset(this.presetId);
  }

  formatResults() {
    const prompt = this.getPreset().getPrompt();
    const promptTail = prompt.text.split(textPlaceholderRegex)[1];
    const formattingSettings = this.resultFormattingSettings;
    let formattedResults: { [recordId: string | number]: Result } = {};
    for (const recordId in this.results) {
      let result = { ...this.results[recordId] };
      if (formattingSettings.insertPromptTailBeforeResult) {
        result.text = `${promptTail}${result.text}`;
      }
      if (formattingSettings.stripInitialWhiteSpace) {
        result.text = result.text.replace(/^(\s*)/, "");
      }
      if (formattingSettings.injectStartText) {
        result.text = `${formattingSettings.injectStartText}${result.text}`;
      }
      if (formattingSettings.stripEndText.length > 0) {
        for (const stripText of formattingSettings.stripEndText) {
          const regex = new RegExp(`${stripText}$`);
          result.text = result.text.replace(regex, "");
        }
      }
      formattedResults[recordId] = result;
    }
    return formattedResults;
  }

  getStatus(): RunStatus {
    let status = ResultStatus.pending;
    let completedRecords = [];
    let failedRecords = [];
    for (const recordId in this.results) {
      const result = this.results[recordId];
      if (result.status === ResultStatus.failed) {
        failedRecords.push(recordId);
      } else if (result.status === ResultStatus.completed) {
        completedRecords.push(recordId);
      }
    }
    let totalRecords = Object.keys(this.results).length;
    if (failedRecords.length > 0) {
      status = ResultStatus.failed;
    }
    if (completedRecords.length === totalRecords) {
      status = ResultStatus.completed;
    }
    if (completedRecords.length > 0 && completedRecords.length < totalRecords) {
      status = ResultStatus.running;
    }
    return { status, completedRecords, failedRecords, totalRecords };
  }
}

export interface settingsSchema {
  [key: string]: {
    key: string;
    label: string;
    link?: string;
    tooltip?: string;
    type: string;
    min?: number;
    max?: number;
    default?: any;
    options?: any[];
    step?: number;
  };
}
