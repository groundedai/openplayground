import { LanguageModelSettings } from "../types";
import * as db from "./base";

export function getLanguageModelSettings(): LanguageModelSettings[] {
  return db.getItems("languageModelSettings") || [];
}

export function createLanguageModelSettings(
  settings: LanguageModelSettings
) {
  db.createItem("languageModelSettings", settings);
}

export function updateLanguageModelSettings(
  languageModelSettings: LanguageModelSettings
) {
  db.updateItem("languageModelSettings", languageModelSettings);
}

export function deleteLanguageModelSettings(
  languageModelSettings: LanguageModelSettings
) {
  db.deleteItem("languageModelSettings", languageModelSettings);
}
