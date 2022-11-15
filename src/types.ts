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
  name: string;
  template: string;

  constructor(values: { name: string; template: string }) {
    this.name = values.name;
    this.template = values.template;
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