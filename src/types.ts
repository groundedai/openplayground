import { makeId } from "./util/data";

export class Project {
  id: string;
  name: string = "New project";

  constructor(values: Object = {}) {
    this.id = makeId();
    Object.assign(this, values);
  }
}

export class Record {
  id: string;
  text: string = "";
  projectId: string;

  constructor(values: { text: string; projectId: string; id?: string }) {
    this.id = values.id || makeId();
    this.projectId = values.projectId;
    this.text = values.text;
  }
}
