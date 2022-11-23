export class Record {
  id: string;
  text: string = "";
  datasetId: string;

  constructor(values: {
    id: string | number;
    text: string;
    datasetId: string;
  }) {
    this.id = values.id.toString();
    this.text = values.text;
    this.datasetId = values.datasetId;
  }
}

export class Dataset {
  id: string;
  name: string;

  constructor(values: { name: string; id: string | number }) {
    this.id = values.id.toString();
    this.name = values.name;
  }
}

export class PromptTemplate {
  id: string;
  name: string;
  template: string;

  constructor(values: { id: string | number; name: string; template: string }) {
    this.id = values.id.toString();
    this.name = values.name;
    this.template = values.template;
  }
}

export class LanguageModelSettings {
  id: string;
  name: string;
  provider: string;
  settings: any;

  constructor(values: {
    id?: string | number;
    name?: string;
    provider: string;
    settings: any;
  }) {
    this.id = values.id ? values.id.toString() : "No ID";
    this.name = values.name ? values.name : "No name";
    this.provider = values.provider;
    this.settings = values.settings;
  }
}

export interface LanguageModel {
  settings: any;
  getSuggestions: (text: string) => Promise<{ data: any; text: string }>;
}

export class Job {
  id: string;
  name: string;
  datasetId: string;
  templateId: string;
  languageModelSettingsId: string;
  status: string = "pending";
  results: { [recordId: string]: any } = {};
  stripInitialWhiteSpace: boolean = false;
  injectStartText: string = "";
  stripEndText: string[] = [];

  constructor(values: {
    id: string | number;
    name?: string;
    datasetId: string;
    templateId: string;
    languageModelSettingsId: string;
    status?: string;
    results?: { [recordId: string]: any };
    stripInitialWhiteSpace?: boolean;
    injectStartText?: string;
    stripEndText?: string[];
  }) {
    this.id = values.id.toString();
    if (values.name) {
      this.name = values.name;
    } else {
      const datestring = new Date().toISOString().slice(0, 10);
      this.name = `Job ${this.id} - ${datestring}`;
    }
    this.datasetId = values.datasetId;
    this.templateId = values.templateId;
    this.languageModelSettingsId = values.languageModelSettingsId;
    this.status = values.status || "pending";
    this.results = values.results || {};
    this.stripInitialWhiteSpace = values.stripInitialWhiteSpace || false;
    this.injectStartText = values.injectStartText || "";
    this.stripEndText = values.stripEndText || [];
  }

  getFormattedResults() {
    let results = { ...this.results };
    for (const recordId in results) {
      let result = results[recordId];
      if (this.stripInitialWhiteSpace) {
        result = result.replace(/^(\s*)/, "");
      }
      if (this.injectStartText) {
        result = `${this.injectStartText}${result}`;
      }
      if (this.stripEndText.length > 0) {
        for (const stripText of this.stripEndText) {
          const regex = new RegExp(`${stripText}$`);
          result = result.replace(regex, "");
        }
      }
      results[recordId] = result;
    }
    return results;
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
