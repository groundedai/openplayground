import { Preset, Prompt, LanguageModelSettings } from "./types";
import { db } from "./main";
import * as yaml from "yaml";
import examplePresetsYAML from "./data/examples/presets.yaml?raw";

const tagColors = [
  "red",
  "pink",
  "purple",
  "deep-purple",
  "indigo",
  "blue",
  "light-blue",
  "cyan",
  "teal",
  "green",
  "light-green",
  "lime",
  "yellow",
  "amber",
  "orange",
  "deep-orange",
  "brown",
  "grey",
  "blue-grey",
];

export function getTagColor(tag: string) {
  // Map tag to a random color and keep in local storage.
  const tagColorMap = JSON.parse(
    localStorage.getItem("presetTagColorMap") || "{}"
  );
  if (!tagColorMap[tag]) {
    // Favour an un-used color if possible
    const usedColors = Object.values(tagColorMap);
    const uniqueColors = tagColors.filter(
      (color) => !usedColors.includes(color)
    );
    const colorChoices = uniqueColors.length ? uniqueColors : tagColors;
    const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
    tagColorMap[tag] = color;
    localStorage.setItem("presetTagColorMap", JSON.stringify(tagColorMap));
  }
  return tagColorMap[tag];
}

export function createPresetFromJson(json: string): Preset {
  const preset = JSON.parse(json);
  const prompt = new Prompt({
    name: preset.prompt.name,
    text: preset.prompt.text,
  });
  db.createPrompt(prompt);
  const languageModelSettings = new LanguageModelSettings({
    name: preset.languageModelSettings.name,
    provider: preset.languageModelSettings.provider,
    apiSettings: preset.languageModelSettings.apiSettings,
  });
  db.createLanguageModelSettings(languageModelSettings);
  const presetObj = new Preset({
    name: preset.name,
    promptId: prompt.id,
    languageModelSettingsId: languageModelSettings.id,
    tags: preset.tags,
    isExample: preset.isExample,
  });
  // Check for name conflicts
  // While there is a name conflict, append a number to the name
  let nameConflict = true;
  let i = 1;
  while (nameConflict) {
    nameConflict = false;
    const existingPresets = db.getPresets();
    for (const existingPreset of existingPresets) {
      if (existingPreset.name === presetObj.name) {
        nameConflict = true;
        presetObj.name = preset.name + " " + i;
        i++;
        break;
      }
    }
  }
  db.createPreset(presetObj);
  return presetObj;
}

export function createPresetFromYAML(yamlString: string): Preset {
  const json = yaml.parse(yamlString);
  return createPresetFromJson(JSON.stringify(json));
}

export function loadExamplePresets() {
  let presets = yaml.parse(examplePresetsYAML);
  presets.forEach((preset: any) => {
    preset.isExample = true;
  });
  const existingPresets = db.getPresets();
  for (const preset of presets) {
    // Create the preset if it doesn't already exist
    let exists = false;
    for (const existingPreset of existingPresets) {
      if (existingPreset.name === preset.name && existingPreset.isExample) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      createPresetFromJson(JSON.stringify(preset));
    }
  }
}
