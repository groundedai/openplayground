import { settingsSchema } from "../types";


export const cohereGenerationSettingsSchema: settingsSchema = {
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
    type: "text",
    default: "",
    key: "stop",
    label: "Stop",
  },
};

export interface CohereGenerationSettings {
  max_tokens: number;
  temperature: number;
  p: number;
  frequency_penalty: number;
  presence_penalty: number;
  stop: string[];
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
