export class Project {
  id: number;
  name: string = 'New project';

  constructor(values: Object = {}) {
    this.id = Math.floor(Math.random() * 1000);
    Object.assign(this, values);
  }
}

