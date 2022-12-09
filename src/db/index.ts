import {
  ID,
  Dataset,
  LanguageModelSettings,
  Preset,
  Record,
  Prompt,
  Run,
  DBItem,
} from "../types";

const itemClasses: { [key: string]: typeof DBItem } = {
  dataset: Dataset,
  languageModelSettings: LanguageModelSettings,
  preset: Preset,
  record: Record,
  run: Run,
  prompt: Prompt,
};

export class DB {
  [key: string]: any;

  constructor() {
    this.makeItemMethods();
  }

  getItems(key: string): Array<any> {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    } else {
      return [];
    }
  }

  getItem(key: string, id: ID): any {
    const items = this.getItems(key);
    return items.find((item) => item.id === id);
  }

  createItem(key: string, item: any) {
    const items = this.getItems(key);
    if (!item.id) {
      const highestId = items.reduce((highest, item) => {
        if (parseInt(item.id) > highest) {
          return parseInt(item.id);
        }
        return highest;
      }, 0);
      const id = highestId + 1;
      item.id = id.toString();
    }
    items.push(item);
    localStorage.setItem(key, JSON.stringify(items));
  }

  updateItem(key: string, item: any) {
    const items = this.getItems(key);
    const index = items.findIndex((i: any) => i.id === item.id);
    items[index] = item;
    localStorage.setItem(key, JSON.stringify(items));
  }

  deleteItem(key: string, item: any) {
    const items = this.getItems(key);
    const index = items.findIndex((i: any) => i.id === item.id);
    items.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(items));
  }

  makeItemMethods() {
    // Create methods for each item type. E.g., getDatasets(), getDataset(id), etc.
    Object.keys(itemClasses).forEach((itemName) => {
      const itemUpper = itemName.charAt(0).toUpperCase() + itemName.slice(1);
      const getItems = `get${itemUpper}s`;
      const getItem = `get${itemUpper}`;
      const createItem = `create${itemUpper}`;
      const updateItem = `update${itemUpper}`;
      const deleteItem = `delete${itemUpper}`;
      this[getItems] = () => {
        const items = this.getItems(itemName) || [];
        return items.map((item) => {
          const itemClass: any = itemClasses[itemName];
          return new itemClass(item);
        });
      };
      this[getItem] = (id: ID) => {
        const item = this.getItem(itemName, id);
        const itemClass: any = itemClasses[itemName];
        return new itemClass(item);
      };
      this[createItem] = (item: any) => {
        this.createItem(itemName, item);
      };
      this[updateItem] = (item: any) => {
        this.updateItem(itemName, item);
      };
      this[deleteItem] = (item: any) => {
        this.deleteItem(itemName, item);
      };
    });
  }

  // Override default methods
  deleteDataset(dataset: Dataset) {
    this.deleteDataset(dataset);
    const records = this.getItems("records");
    records.forEach((r) => {
      if (r.datasetId === dataset.id) {
        this.deleteRecord(r);
      }
    });
  }

  getDatasetByName(name: string): Dataset | undefined {
    const datasets = this.getDatasets();
    return datasets.find((d: Dataset) => d.name === name);
  }

  deletePreset(preset: Preset) {
    this.deletePreset(preset);
    const languageModelSettings = this.getItems("languageModelSettings");
    languageModelSettings.forEach((lms) => {
      if (lms.presetId === preset.id) {
        this.deleteLanguageModelSettings(lms);
      }
    });
    const prompts = this.getItems("prompts");
    prompts.forEach((p) => {
      if (p.presetId === preset.id) {
        this.deletePrompt(p);
      }
    });
  }

  getPresetByName(name: string): Preset | undefined {
    const presets = this.getPresets();
    return presets.find((p: Preset) => p.name === name);
  }
}
