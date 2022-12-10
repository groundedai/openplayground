import { LanguageModel, settingsSchema } from "../types";

export const hfGenerationSettingsSchema: settingsSchema = {
  apiKey: {
    key: "apiKey",
    type: "password",
    label: "API Key",
    link: "https://huggingface.co/settings/token",
    default: "",
  },
  /*
  Multitask finetuned on xP3. Recommended for prompting in English.  
  |Parameters|300M|580M|1.2B|3.7B|13B|560M|1.1B|1.7B|3B|7.1B|176B|
  |---|---|---|---|---|---|---|---|---|---|---|---|
  |Finetuned Model|mt0-base|mt0-small|mt0-large|mt0-xl|mt0-xxl|bloomz-560m|bloomz-1b1|bloomz-1b7|bloomz-3b|bloomz-7b1|bloomz|
  */
  model: {
    type: "select",
    options: [
      { value: "bigscience/bloomz-7b1", label: "bloomz-7b1" },
      { value: "bigscience/bloomz-3b", label: "bloomz-3b" },
      { value: "bigscience/bloomz-1b7", label: "bloomz-1b7" },
      { value: "bigscience/bloomz-1b1", label: "bloomz-1b1" },
      { value: "bigscience/bloomz-560m", label: "bloomz-560m" },
      { value: "bigscience/mt0-xxl", label: "mt0-xxl" },
      { value: "bigscience/mt0-xl", label: "mt0-xl" },
      { value: "bigscience/mt0-large", label: "mt0-large" },
      { value: "bigscience/mt0-small", label: "mt0-small" },
      { value: "bigscience/mt0-base", label: "mt0-base" },
    ],
    default: "bloomz-7b1",
    key: "model",
    label: "Model",
    link: "https://huggingface.co/bigscience/bloomz",
  },
  maxTokens: {
    type: "number",
    default: 100,
    min: 0,
    max: 1000,
    step: 10,
    key: "max_new_tokens",
    label: "Max Tokens",
  },
  temperature: {
    type: "number",
    default: 0.7,
    min: 0,
    max: 1,
    key: "temperature",
    label: "Temperature",
  },
  topP: {
    type: "number",
    default: 0.9,
    min: 0,
    max: 1,
    key: "p",
    label: "Top P",
  },
  frequencyPenalty: {
    type: "number",
    default: 0,
    min: 0,
    max: 100,
    key: "repetition_penalty",
    label: "Frequency Penalty",
  },
  // topK: {
  //   type: "number",
  //   default: 0,
  //   min: 0,
  //   max: 1,
  //   key: "top_k",
  //   label: "Top K",
  // },
  doSample: {
    type: "checkbox",
    default: false,
    key: "do_sample",
    label: "Do Sample",
    tooltip: "Whether or not to use sampling; use greedy decoding otherwise. \
    Use sampling if you want to generate a random sequence that looks more like natural language. \
    Use greedy decoding if you want to generate a deterministic sequence that looks more like a computer program. \
    Sampling here means picking the next token among the top tokens with probabilities that follow the softmax distribution.",
  },
  // returnSequences: {
  //   type: "number",
  //   default: 1,
  //   min: 1,
  //   max: 10,
  //   step: 1,
  //   key: "num_return_sequences",
  //   label: "Return Sequences",
  // },
};

export interface HfBaseSettings {
  apiKey: string;
}

export interface HfGenerationSettings extends HfBaseSettings {
  model: string;
  max_new_tokens: number;
  temperature: number;
  // top_k: number | null,
  top_p: number | null,
  do_sample: boolean, //not greedy decoding
  // seed: number,
  // early_stopping: boolean,
  // no_repeat_ngram_size: number,
  num_beams: number,
  num_return_sequences: number | null,
  // repetition_penalty : number | null,
  return_full_text: boolean,
  wait_for_model: boolean,
}

export const hfGenerationBodyKeys = [
  "model",
  "max_new_tokens",
  "temperature",
  // "top_k",
  "top_p",
  "do_sample",
  // "seed",
  // "early_stopping",
  // "no_repeat_ngram_size",
  // "num_beams",
  "return_full_text",
  "wait_for_model",
];


class HfException extends Error {
  body: any;
  constructor(message: string, body: any) {
    super(message);
    this.name = "Huggingface Error";
    this.message = message;
    this.body = body;
  }
}

export class HfLanguageModel implements LanguageModel {
  apiKey: string;
  model: string;
  settings: HfGenerationSettings;

  constructor(settings: any) {
    this.apiKey = settings.apiKey;
    this.model = settings.model;
    const newSettings: any = {};

    // newSettings.top_k = settings.top_k === 0 ? null : settings.top_k;
    newSettings.do_sample = settings.num_beams > 0 ? false : settings.do_sample;
    // newSettings.num_beams = !settings.do_sample || settings.num_beams === 0 ? null : settings.num_beams;
    // newSettings.no_repeat_ngram_size = settings.num_beams === null ? null : settings.no_repeat_ngram_size;
    newSettings.top_p = settings.num_beams ? null : settings.top_p;
    // newSettings.early_stopping = settings.num_beams === null ? null : settings.num_beams > 0;
    newSettings.return_full_text = false;
    //newSettings.wait_for_model = true;
    newSettings.max_new_tokens = settings.max_new_tokens;
    newSettings.temperature = settings.temperature;
    // newSettings.seed = settings.seed;
    // newSettings.num_return_sequences = settings.num_return_sequences;

    this.settings = newSettings;
  }

  async getSuggestions(prompt: string) {
    const body = {
      inputs: prompt,
      parameters: this.settings,
      options: { wait_for_model: true },  //TODO: Handle wormup
    };
    console.log(body);
    const response = fetch(`https://api-inference.huggingface.co/models/${this.model}`, {
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
            throw new HfException(json.message, json);
          });
        }
      })
      .then((json) => {
        var output = "";
        for (var text of json) {
          var generated_text = text.generated_text;
          if (generated_text.startsWith(prompt)) {
            generated_text = generated_text.slice(prompt.length);
          }
          if (output.length > 0) {  // TODO: better way to handle multiple sequences
            output += "\n\n\t";
          }
          output += generated_text;
        }
        return { data: json, text: output};
      })
      .catch((err) => {
        throw new HfException(err.message, err);
      });
  }
}
