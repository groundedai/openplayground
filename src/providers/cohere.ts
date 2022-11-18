import { settingsSchema } from "../types";

export const cohereGenerationSettingsSchema: settingsSchema = {
  model: {
    type: "select",
    options: [
      { value: "command-xlarge-20221108", label: "command-xlarge-20221108" },
      { value: "xlarge-20221108", label: "xlarge-20221108" },
      { value: "xlarge", label: "xlarge-20220609" },
      { value: "large", label: "large-20220926" },
      { value: "medium-20221108", label: "medium-20221108" },
      { value: "medium", label: "medium-20220926" },
      { value: "small", label: "small-20220926" },
    ],
    default: "xlarge-20221108",
    key: "model",
    label: "Model",
  },
  maxTokens: {
    type: "number",
    default: 100,
    min: 0,
    max: 1000,
    step: 10,
    key: "max_tokens",
    label: "Max Tokens",
  },
  temperature: {
    type: "number",
    default: 0.9,
    min: 0,
    max: 1,
    key: "temperature",
    label: "Temperature",
  },
  topP: {
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    key: "p",
    label: "Top P",
  },
  frequencyPenalty: {
    type: "number",
    default: 0,
    min: 0,
    max: 1,
    key: "frequency_penalty",
    label: "Frequency Penalty",
  },
  presencePenalty: {
    type: "number",
    default: 0,
    min: 0,
    max: 1,
    key: "presence_penalty",
    label: "Presence Penalty",
  },
  stop: {
    type: "string-array",
    default: "",
    key: "stop_sequences",
    label: "Stop sequences",
  },
};

export interface CohereGenerationSettings {
  model: string;
  max_tokens: number;
  temperature: number;
  p: number;
  frequency_penalty: number;
  presence_penalty: number;
  stop_sequences: string[];
}

export class CohereLanguageModel {
  apiKey: string;
  settings: CohereGenerationSettings;

  constructor({
    apiKey,
    settings,
  }: {
    apiKey: string;
    settings: CohereGenerationSettings;
  }) {
    this.apiKey = apiKey;
    this.settings = settings;
  }

  async getSuggestions(prompt: string, settings?: CohereGenerationSettings) {
    if (settings) {
      this.settings = settings;
    }
    const body = {
      prompt,
      ...this.settings,
    };
    console.log(body);
    const response = fetch("https://api.cohere.ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });
    return response.then((res) => {
      const json = res.json();
      return json;
    });
  }
}
