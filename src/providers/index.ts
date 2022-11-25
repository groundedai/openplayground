import {
  cohereGenerationSettingsSchema,
  CohereLanguageModel,
} from "../providers/cohere";
import {
  openaiGenerationSettingsSchema,
  OpenAILanguageModel,
} from "../providers/openai";

export const languageModelProviders = ["cohere", "openai"];
export const providerToSettingsSchema: {
  [key: string]: any;
} = {
  cohere: cohereGenerationSettingsSchema,
  openai: openaiGenerationSettingsSchema,
};
export const providerToStorageKey: {
  [key: string]: string;
} = {
  cohere: "playgroundCohereGenerationSettings",
  openai: "playgroundOpenAIGenerationSettings",
};
export const providerToClass: {
  [key: string]: any;
} = {
  cohere: CohereLanguageModel,
  openai: OpenAILanguageModel,
};
export const defaultProvider = "cohere";
