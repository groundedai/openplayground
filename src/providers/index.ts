import {
  cohereGenerationSettingsSchema,
  CohereLanguageModel,
} from "../providers/cohere";
import {
  openaiGenerationSettingsSchema,
  OpenAILanguageModel,
} from "../providers/openai";
import {
  hfGenerationSettingsSchema,
  HfLanguageModel,
} from "../providers/huggingface";

export const languageModelProviders = ["cohere", "openai", "huggingface"];
export const providerToSettingsSchema: {
  [key: string]: any;
} = {
  cohere: cohereGenerationSettingsSchema,
  openai: openaiGenerationSettingsSchema,
  huggingface: hfGenerationSettingsSchema,
};
export const providerToStorageKey: {
  [key: string]: string;
} = {
  cohere: "playgroundCohereGenerationSettings",
  openai: "playgroundOpenAIGenerationSettings",
  huggingface: "playgroundHfGenerationSettings",
};
export const providerToClass: {
  [key: string]: any;
} = {
  cohere: CohereLanguageModel,
  openai: OpenAILanguageModel,
  huggingface: HfLanguageModel,
};
export const defaultProvider = "cohere";
