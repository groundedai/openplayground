import { LanguageModel, settingsSchema } from "../types";

export const openaiGenerationSettingsSchema: settingsSchema = {
  apiKey: {
    key: "apiKey",
    type: "password",
    label: "API Key",
    default: "",
  },
  model: {
    type: "select",
    options: [
      {
        label: "text-davinci-002",
        value: "text-davinci-002",
      },
      {
        label: "text-curie-001",
        value: "text-curie-001",
      },
      {
        label: "text-babbage-001",
        value: "text-babbage-001",
      },
      {
        label: "text-ada-001",
        value: "text-ada-001",
      },
    ],
    default: "text-davinci-002",
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
    key: "top_p",
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
    key: "stop",
    label: "Stop sequences",
  },
};

export interface openaiBaseSettings {
  apiKey: string;
}

export interface openaiGenerationSettings extends openaiBaseSettings {
  model: string;
  max_tokens: number;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  stop: string[];
}

export const openaiGenerationBodyKeys = [
  "model",
  "max_tokens",
  "temperature",
  "top_p",
  "frequency_penalty",
  "presence_penalty",
  "stop",
];

class OpenAIException extends Error {
  body: any;
  constructor(message: string, body: any) {
    super(message);
    this.name = "OpenAI Error";
    this.message = message;
    this.body = body;
  }
}

export class OpenAILanguageModel implements LanguageModel {
  apiKey: string;
  settings: openaiGenerationSettings;

  constructor(settings: any) {
    this.apiKey = settings.apiKey;
    const newSettings: any = {};
    for (const key of openaiGenerationBodyKeys) {
      const val = settings[key];
      if (val !== undefined) {
        if (key === "stop") {
          console.log(val);
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
    const response = fetch("https://api.openai.com/v1/completions", {
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
          return res.json().then((body) => {
            throw new OpenAIException(res.statusText, body);
          });
        }
      })
      .then((res) => {
        let data = { data: res, text: res.choices[0].text };
        return data;
      })
      .catch((err) => {
        throw new OpenAIException(err.message, err);
      });
  }
}
