import { SettingsPanel } from "./settings-panel";
import { run } from "../types";

const formatResultsSettingsSchema = {
  stripInitialWhiteSpace: {
    label: "Strip initial whitespace",
    type: "checkbox",
    default: false,
    key: "stripInitialWhiteSpace" as keyof run,
  },
  injectStartText: {
    label: "Inject start text",
    type: "text",
    default: "",
    key: "injectStartText" as keyof run,
  },
  stripEndText: {
    label: "Strip end text",
    type: "string-array",
    default: [],
    key: "stripEndText" as keyof run,
  },
};

export interface FormatResultsSettings {
  stripInitialWhiteSpace: boolean;
  injectStartText: string;
  stripEndText: string[];
}

export class FormatResultsSettingsPanel extends SettingsPanel {
  constructor(container: HTMLDivElement) {
    super(container, formatResultsSettingsSchema);
  }

  getSettings(): FormatResultsSettings {
    return super.getSettings() as FormatResultsSettings;
  }
}
