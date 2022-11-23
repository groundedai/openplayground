import { LanguageModel, settingsSchema } from "../types";

export const cohereGenerationSettingsSchema: settingsSchema = {
  apiKey: {
    key: "apiKey",
    type: "password",
    label: "API Key",
    default: "",
  },
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

export interface CohereBaseSettings {
  apiKey: string;
}

export interface CohereGenerationSettings extends CohereBaseSettings {
  model: string;
  max_tokens: number;
  temperature: number;
  p: number;
  frequency_penalty: number;
  presence_penalty: number;
  stop_sequences: string[];
}

export const cohereGenerationBodyKeys = [
  "model",
  "max_tokens",
  "temperature",
  "p",
  "frequency_penalty",
  "presence_penalty",
  "stop_sequences",
];

class CohereException extends Error {
  body: any;
  constructor(message: string, body: any) {
    super(message);
    this.name = "Cohere Error";
    this.message = message;
    this.body = body;
  }
}

export class CohereLanguageModel implements LanguageModel {
  apiKey: string;
  settings: CohereGenerationSettings;

  constructor(settings: any) {
    this.apiKey = settings.apiKey;
    const newSettings: any = {};
    for (const key of cohereGenerationBodyKeys) {
      const val = settings[key];
      if (val !== undefined) {
        if (key === "stop_sequences") {
          if (val.length > 0 && val[0].length > 0) {
            newSettings[key] = val;
          }
        } else {
          newSettings[key] = val;
        }
      }
    }
    this.settings = newSettings;
  }

  async getSuggestions(prompt: string) {
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
    return response
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then((json) => {
            throw new CohereException(json.message, json);
          });
        }
      })
      .then((json) => {
        return { data: json, text: json.text };
      })
      .catch((err) => {
        throw new CohereException(err.message, err);
      });
  }
}
