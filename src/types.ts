export class Project {
  id: number;
  name: string = "New project";

  constructor(values: Object = {}) {
    this.id = Math.floor(Math.random() * 1000);
    Object.assign(this, values);
  }
}

export class Record {
  id: number = 0;
  text: string = "";

  constructor(values: { text: string; id?: number }) {
    this.id = values.id || Math.floor(Math.random() * 1000);
    this.text = values.text;
  }
}

export class Data {
  id: number;
  project: Project | null = null;
  records: Array<Record> = [];

  constructor(values: Object = {}) {
    this.id = Math.floor(Math.random() * 1000);
    Object.assign(this, values);
  }
}
