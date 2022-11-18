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
    id: string | number;
    name: string;
    provider: string;
    settings: any;
  }) {
    this.id = values.id.toString();
    this.name = values.name;
    this.provider = values.provider;
    this.settings = values.settings;
  }
}

export class Job {
  id: string;
  name: string;
  datasetId: string;
  templateId: string;
  languageModelSettingsId: string;
  status: string = "pending";
  results: { [recordId: string]: any } = {};

  constructor(values: {
    id: string | number;
    name: string;
    datasetId: string;
    templateId: string;
    languageModelSettingsId: string;
    status?: string;
  }) {
    this.id = values.id.toString();
    this.name = values.name;
    this.datasetId = values.datasetId;
    this.templateId = values.templateId;
    this.languageModelSettingsId = values.languageModelSettingsId;
    this.status = values.status || "pending";
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
