import { PromptTemplate } from "../types";
import * as db from "./base";

export function getPromptTemplates() {
  return db.getItems("promptTemplates") || [];
}

export function createPromptTemplate(promptTemplate: PromptTemplate) {
  db.createItem("promptTemplates", promptTemplate);
}

export function updatePromptTemplate(promptTemplate: PromptTemplate) {
  db.updateItem("promptTemplates", promptTemplate);
}

export function deletePromptTemplate(promptTemplate: PromptTemplate) {
  db.deleteItem("promptTemplates", promptTemplate);
}
