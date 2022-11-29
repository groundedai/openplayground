import { getRecords } from "./db/records";
import { getPromptTemplates } from "./db/prompt-templates";

export type ID = string | number | null;

export class DBItem {
  id: ID;

  constructor({ id = null }: { id?: ID }) {
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

  constructor({ id, name }: { id?: ID; name: string }) {
    super({ id });
    this.name = name;
  }

  getRecords() {
    return getRecords().filter((record) => record.datasetId === this.id);
  }
}

export class PromptTemplate extends DBItem {
  name: string;
  template: string;

  constructor({
    id,
    name,
    template,
  }: {
    id?: ID;
    name: string;
    template: string;
  }) {
    super({ id });
    this.name = name;
    this.template = template;
  }
}

export class LanguageModelSettings extends DBItem {
  name: string;
  provider: string;
  settings: any;

  constructor({
    id,
    name,
    provider,
    settings,
  }: {
    id?: ID;
    name?: string;
    provider: string;
    settings: any;
  }) {
    super({ id });
    this.name = name ? name : "No name";
    this.provider = provider;
    this.settings = settings;
  }
}

export interface LanguageModel {
  settings: any;
  getSuggestions: (text: string) => Promise<{ data: any; text: string }>;
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

export class Run extends DBItem {
  name: string;
  datasetId: string;
  datasetLength: number;
  templateId: string;
  languageModelSettingsId: string;
  results: { [recordId: string | number]: Result };
  insertPromptTailBeforeResult: boolean = true;
  stripInitialWhiteSpace: boolean = false;
  injectStartText: string = "";
  stripEndText: string[] = [];
  createdAt: Date;

  constructor({
    id,
    name,
    datasetId,
    datasetLength,
    templateId,
    languageModelSettingsId,
    results,
    insertPromptTailBeforeResult,
    stripInitialWhiteSpace,
    injectStartText,
    stripEndText,
    createdAt,
  }: {
    id?: ID;
    name?: string;
    datasetId: string;
    datasetLength: number;
    templateId: string;
    languageModelSettingsId: string;
    results?: { [recordId: string | number]: Result };
    insertPromptTailBeforeResult?: boolean;
    stripInitialWhiteSpace?: boolean;
    injectStartText?: string;
    stripEndText?: string[];
    createdAt?: Date;
  }) {
    super({ id });
    this.name = name ? name : `Run ${this.id}`;
    this.datasetId = datasetId;
    this.datasetLength = datasetLength;
    this.templateId = templateId;
    this.languageModelSettingsId = languageModelSettingsId;
    this.insertPromptTailBeforeResult = insertPromptTailBeforeResult || true;
    this.stripInitialWhiteSpace = stripInitialWhiteSpace || false;
    this.injectStartText = injectStartText || "";
    this.stripEndText = stripEndText || [];
    this.createdAt = new Date(createdAt || Date.now());
    if (results) {
      this.results = results;
    } else {
      this.results = {};
      this.resetResults();
    }
  }

  resetResults() {
    const records = getRecords().filter(
      (record) => record.datasetId === this.datasetId
    );
    for (const record of records) {
      this.results[record.id] = {
        text: "",
        status: ResultStatus.pending,
      };
    }
  }

  getFormattedResults() {
    const promptTemplate = getPromptTemplates().find(
      (template) => template.id === this.templateId
    );
    let formattedResults: { [recordId: string | number]: Result } = {};
    for (const recordId in this.results) {
      let result = { ...this.results[recordId] };
      if (this.insertPromptTailBeforeResult) {
        const promptTail = promptTemplate.template.split("{{ text }}")[1];
        result.text = `${promptTail}${result.text}`;
      }
      if (this.stripInitialWhiteSpace) {
        result.text = result.text.replace(/^(\s*)/, "");
      }
      if (this.injectStartText) {
        result.text = `${this.injectStartText}${result.text}`;
      }
      if (this.stripEndText.length > 0) {
        for (const stripText of this.stripEndText) {
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
    type: string;
    min?: number;
    max?: number;
    default?: any;
    options?: any[];
    step?: number;
  };
}
