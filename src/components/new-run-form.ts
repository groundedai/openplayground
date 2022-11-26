import { Component } from "./component";
import newRunFormHtml from "./new-run-form.html?raw";
import { Dataset, LanguageModelSettings, PromptTemplate, Run } from "../types";
import { getRecords } from "../db/records";
import { FormatResultsSettingsPanel } from "../components/format-results-settings-panel";

export class NewRunForm extends Component {
  selectDataset: HTMLSelectElement = this.container.querySelector(
    "#dataset"
  ) as HTMLSelectElement;
  selectTemplate: HTMLSelectElement = this.container.querySelector(
    "#template"
  ) as HTMLSelectElement;
  selectSettings: HTMLSelectElement = this.container.querySelector(
    "#settings"
  ) as HTMLSelectElement;
  form: HTMLFormElement = this.container.querySelector(
    "#form"
  ) as HTMLFormElement;
  formatResultsSettingsPanelContainer: HTMLDivElement = document.querySelector(
    "#format-results-settings-panel"
  ) as HTMLDivElement;
  formatResultsSettingsPanel: FormatResultsSettingsPanel;
  datasets: Dataset[];
  templates: PromptTemplate[];
  settings: LanguageModelSettings[];
  onSubmit: (run: Run) => void;

  constructor({
    datasets,
    templates,
    settings,
    onSubmit,
  }: {
    container?: HTMLElement;
    datasets: Dataset[];
    templates: PromptTemplate[];
    settings: LanguageModelSettings[];
    onSubmit: (run: Run) => void;
  }) {
    const newRunForm = document.createElement("div");
    newRunForm.innerHTML = newRunFormHtml;
    super({ container: newRunForm });
    this.formatResultsSettingsPanel = new FormatResultsSettingsPanel(
      this.formatResultsSettingsPanelContainer
    );
    this.datasets = datasets;
    this.templates = templates;
    this.settings = settings;
    this.onSubmit = onSubmit;
  }

  render() {
    this.datasets.forEach((dataset) => {
      const option = document.createElement("option");
      option.value = dataset.id as string;
      option.innerText = dataset.name;
      this.selectDataset.appendChild(option);
    });
    this.templates.forEach((template) => {
      const option = document.createElement("option");
      option.value = template.id as string;
      option.innerText = template.name;
      this.selectTemplate.appendChild(option);
    });
    this.settings.forEach((setting) => {
      const option = document.createElement("option");
      option.value = setting.id as string;
      option.innerText = setting.name;
      this.selectSettings.appendChild(option);
    });
    this.formatResultsSettingsPanel.render();
    this.addListeners();
  }

  addListeners() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const datasetId = this.selectDataset?.value;
      const records = getRecords().filter(
        (record) => record.datasetId === datasetId
      );
      const templateId = this.selectTemplate?.value;
      const settingsId = this.selectSettings?.value;
      const formatResultsSettings =
        this.formatResultsSettingsPanel.getSettings();
      const newRun = new Run({
        datasetId: datasetId,
        datasetLength: records.length,
        templateId,
        languageModelSettingsId: settingsId,
        stripInitialWhiteSpace: formatResultsSettings.stripInitialWhiteSpace,
        injectStartText: formatResultsSettings.injectStartText,
        stripEndText: formatResultsSettings.stripEndText,
      });
      this.onSubmit(newRun);
    });
  }
}
