import { getRecords } from "./db/records";

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
    this.stripInitialWhiteSpace = stripInitialWhiteSpace || false;
    this.injectStartText = injectStartText || "";
    this.stripEndText = stripEndText || [];
    this.createdAt = createdAt || new Date();
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
    let results = { ...this.results };
    for (const recordId in results) {
      let result = results[recordId];
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
      results[recordId] = result;
    }
    return results;
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
    type: string;
    min?: number;
    max?: number;
    default?: any;
    options?: any[];
    step?: number;
  };
}
