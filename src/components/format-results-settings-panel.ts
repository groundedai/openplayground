import { SettingsPanel } from "./settings-panel";

const formatResultsSettingsSchema = {
  stripInitialWhiteSpace: {
    label: "Strip initial whitespace",
    type: "checkbox",
    default: false,
    key: "stripInitialWhiteSpace",
  },
  injectStartText: {
    label: "Inject start text",
    type: "text",
    default: "",
    key: "injectStartText",
  },
};

export class FormatResultsSettingsPanel extends SettingsPanel {
  constructor(container: HTMLDivElement) {
    super(container, formatResultsSettingsSchema);
  }

  on(event: string, callback: (settings: any) => void) {
    this.container.addEventListener(event, (e: any) => {
      callback(e.detail);
    });
  }
}
