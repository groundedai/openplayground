import { Component } from "./component";
import settingsPanelCss from "./settings-panel.css?raw";
import settingsPanelHtml from "./settings-panel.html?raw";
import { settingsSchema } from "../types";
import { tooltips } from "../providers/common";

export class SettingsPanel extends Component {
  schema: settingsSchema;
  innerContainer: HTMLElement = this.container.querySelector(
    ".inner-container"
  ) as HTMLElement;
  settings: any;

  constructor(container: HTMLElement, schema: settingsSchema) {
    super({ container, html: settingsPanelHtml, css: settingsPanelCss });
    this.schema = schema;
    this.settings = {};
  }

  render() {
    let html = "";
    for (let key in this.schema) {
      const item = this.schema[key];
      var label = item.label;
      const tooltip = item.tooltip || tooltips[key];
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
      } else if (type === "password") {
        defaultVal = defaultVal || "";
        inputHtml = `
          <input
            type="password"
            name="${key}"
            id="${key}"
            value="${defaultVal}"
          />
          <i class="fa-regular fa-eye" id="${key}TogglePassword" style="margin-left: -30px; cursor: pointer; background: white"></i>
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
      } else if (type === "datalist") {
        if (!item.options) {
          throw new Error("Select type requires options");
        }
        inputHtml = `
          <input name="${key}" id="${key}" list="${key}_list" placeholder="${defaultVal}"/>
          <datalist id="${key}_list">
            ${item.options
              .map(
                (option) =>
                  `<option value="${option.value}">${option.label}</option>`
              )
              .join("")}
          </datalist>
        `;
      } else if (type === "string-array") {
        defaultVal = defaultVal || [];
        inputHtml = `
          <input
            name="${key}"
            id="${key}"
            value="${defaultVal.join(", ")}"
            type="text"
          />
        `;
      } else {
        throw new Error(`Unknown type ${type}`);
      }
      const link = item.link
        ? ` <a href="${item.link}" target="_blank" class="label-link"><i class="fa-solid fa-up-right-from-square"></i></a>`
        : "";
      label = tooltip
       ? ` <div class="tooltip" >${label}<span class="tooltiptext">${tooltip}</span></div>`
       : label;
      html += `
        <div class="setting">
          <label for="${key}">${label}${link}</label>
          <br />
          ${inputHtml}
        </div>
      `;
    }
    this.innerContainer.innerHTML = html;
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
      } else if (type === "password") {
        this.settings[itemKey] = input.value;
      } else if (type === "checkbox") {
        this.settings[itemKey] = input.checked;
      } else if (type === "select") {
        this.settings[itemKey] = input.value;
      } else if (type === "datalist") {
        this.settings[itemKey] = input.value || item.default;
      } else if (type === "string-array") {
        this.settings[itemKey] = input.value.split(",").map((x) => x.trim());
      } else {
        throw new Error(`Unknown type ${type}`);
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
      if (settings[itemKey] === undefined) {
        input.value = item.default;
      } else {
        if (type === "number") {
          input.value = settings[itemKey].toString();
        } else if (type === "text") {
          input.value = settings[itemKey];
        } else if (type === "password") {
          input.value = settings[itemKey];
        } else if (type === "checkbox") {
          input.checked = settings[itemKey];
        } else if (type === "select") {
          input.value = settings[itemKey];
        } else if (type === "datalist") {
          input.value = settings[itemKey];
        } else if (type === "string-array") {
          input.value = settings[itemKey].join(", ");
        }
      }
    }
  }

  setSetting(key: string, value: any) {
    const input = this.container.querySelector(`#${key}`) as HTMLInputElement;
    if (!input) {
      throw new Error(
        `No input with id ${key}. Available inputs: ${Object.keys(
          this.schema
        ).join(", ")}`
      );
    } else {
      input.value = value;
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
      input.addEventListener("input", () => {
        const event = new CustomEvent("change", {
          detail: {
            key,
            value: this.getSettings()[item.key],
          },
        });
        this.container.dispatchEvent(event);
      });
      if (type === "password") {
        const showPasswordButton =
          input.nextElementSibling as HTMLButtonElement;
        showPasswordButton.addEventListener("click", () => {
          if (input.type === "password") {
            input.type = "text";
          } else {
            input.type = "password";
          }
          showPasswordButton.classList.toggle("fa-eye");
          showPasswordButton.classList.toggle("fa-eye-slash");
        });
      }
    }
  }
}
