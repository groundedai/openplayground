/* Generate a settings panel given a schema. */
import { settingsSchema } from "../types";

export class SettingsPanel {
  container: HTMLDivElement;
  schema: settingsSchema;
  settings: any;

  constructor(container: HTMLDivElement, schema: settingsSchema) {
    this.container = container;
    this.schema = schema;
    this.settings = {};
  }

  render() {
    let html = "";
    for (let key in this.schema) {
      const item = this.schema[key];
      const label = item.label;
      const type = item.type;
      const min = item.min;
      const max = item.max;
      let defaultVal = item.default;
      let inputHtml = "";
      if (type === "number") {
        defaultVal = defaultVal || 0;
        let step = item.step || 1;
        if (!item.step) {
          if (min !== undefined && max !== undefined) {
            step = (max - min) / 10;
            // To nearest degree of magnitude
            step = Math.pow(10, Math.floor(Math.log10(step)));
          }
        } else {
          step = item.step;
        }
        inputHtml = `
          <input
            type="number"
            name="${key}"
            id="${key}"
            min="${min}"
            max="${max}"
            value="${defaultVal}"
            step="${step}"
          />
        `;
      } else if (type === "text") {
        defaultVal = defaultVal || "";
        inputHtml = `
          <input
            type="text"
            name="${key}"
            id="${key}"
            value="${defaultVal}"
          />
        `;
      } else if (type === "checkbox") {
        defaultVal = defaultVal || false;
        inputHtml = `
          <input
            type="checkbox"
            name="${key}"
            id="${key}"
            ${defaultVal ? "checked" : ""}
          />
        `;
      } else if (type === "select") {
        if (!item.options) {
          throw new Error("Select type requires options");
        }
        inputHtml = `
          <select name="${key}" id="${key}">
            ${item.options
              .map(
                (option) =>
                  `<option value="${option.value}" ${
                    option.value === defaultVal ? "selected" : ""
                  }>${option.label}</option>`
              )
              .join("")}
          </select>
        `;
      }
      html += `
        <div class="setting">
          <label for="${key}">${label}</label>
          ${inputHtml}
        </div>
      `;
    }
    this.container.innerHTML = html;
    this.addListeners();
  }

  getSettings() {
    for (let key in this.schema) {
      const item = this.schema[key];
      const itemKey = item.key;
      const type = item.type;
      const input = this.container.querySelector(`#${key}`) as HTMLInputElement;
      if (type === "number") {
        this.settings[itemKey] = Number(input.value);
      } else if (type === "text") {
        this.settings[itemKey] = input.value;
      } else if (type === "checkbox") {
        this.settings[itemKey] = input.checked;
      } else if (type === "select") {
        this.settings[itemKey] = input.value;
      }
    }
    return this.settings;
  }

  setSettings(settings: any) {
    for (let key in this.schema) {
      const item = this.schema[key];
      const itemKey = item.key;
      const type = item.type;
      const input = this.container.querySelector(`#${key}`) as HTMLInputElement;
      if (type === "number") {
        input.value = settings[itemKey].toString();
      } else if (type === "text") {
        input.value = settings[itemKey];
      } else if (type === "checkbox") {
        input.checked = settings[itemKey];
      } else if (type === "select") {
        input.value = settings[itemKey];
      }
    }
  }

  addListeners() {
    for (let key in this.schema) {
      const item = this.schema[key];
      const type = item.type;
      const input = this.container.querySelector(`#${key}`) as HTMLInputElement;
      if (type === "number") {
        input.addEventListener("input", () => {
          const value = Number(input.value);
          if (item.min !== undefined && value < item.min) {
            input.value = item.min.toString();
          }
          if (item.max !== undefined && value > item.max) {
            input.value = item.max.toString();
          }
        });
      }
      input.addEventListener("change", () => {
        const event = new CustomEvent("settings-change", {
          detail: {
            key,
            value: this.getSettings()[item.key],
          },
        });
        this.container.dispatchEvent(event);
      });
    }
  }
}
