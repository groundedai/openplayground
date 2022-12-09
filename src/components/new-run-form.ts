import { Component } from "./component";
import newRunFormHtml from "./new-run-form.html?raw";
import { Dataset, Preset, Run } from "../types";
import { FormatResultsSettingsPanel } from "../components/format-results-settings-panel";

export class NewRunForm extends Component {
  selectDataset: HTMLSelectElement = this.container.querySelector(
    "#dataset"
  ) as HTMLSelectElement;
  selectPreset: HTMLSelectElement = this.container.querySelector(
    "#preset"
  ) as HTMLSelectElement;
  form: HTMLFormElement = this.container.querySelector(
    "#form"
  ) as HTMLFormElement;
  formatResultsSettingsPanelContainer: HTMLDivElement =
    this.container.querySelector(
      "#format-results-settings-panel"
    ) as HTMLDivElement;
  formatResultsSettingsPanel: FormatResultsSettingsPanel;
  datasets: Dataset[];
  presets: Preset[];
  onSubmit: (run: Run) => void;

  constructor({
    datasets,
    presets,
    onSubmit,
  }: {
    container?: HTMLElement;
    datasets: Dataset[];
    presets: Preset[];
    onSubmit: (run: Run) => void;
  }) {
    const newRunForm = document.createElement("div");
    newRunForm.innerHTML = newRunFormHtml;
    super({ container: newRunForm });
    this.formatResultsSettingsPanel = new FormatResultsSettingsPanel(
      this.formatResultsSettingsPanelContainer
    );
    this.datasets = datasets;
    this.presets = presets;
    this.onSubmit = onSubmit;
  }

  render() {
    this.datasets.forEach((dataset) => {
      const option = document.createElement("option");
      option.value = dataset.id as string;
      option.innerText = dataset.name;
      this.selectDataset.appendChild(option);
    });
    this.presets.forEach((preset) => {
      const option = document.createElement("option");
      option.value = preset.id as string;
      option.innerText = preset.name;
      this.selectPreset.appendChild(option);
    });
    this.formatResultsSettingsPanel.render();
    this.addListeners();
  }

  addListeners() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const datasetId = this.selectDataset?.value;
      const presetId = this.selectPreset?.value;
      const resultFormattingSettings =
        this.formatResultsSettingsPanel.getSettings();
      const newRun = new Run({
        datasetId,
        presetId,
        resultFormattingSettings,
      });
      this.onSubmit(newRun);
    });
  }
}
